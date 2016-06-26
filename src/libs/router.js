
export class Router {

	/**
	 * foward()
	 * @type {History}
	 */
	forward = null;

	/**
	 * back()
	 * @type {History}
	 */
	back = null;

	/**
	 * _pushState()
	 * @type {History}
	 */
	pushState = null;

	/**
	 * _replaceState()
	 * @type {History}
	 */
	replaceState = null;

	/**
	 * forceUrlchange
	 * @type {Boolean}
	 */
	forceUrlchange = false;

	/**
	 * scope
	 * @type {Object}
	 */
	scope = {
		action: null,
		urlchange: null,
	};

	/**
	 * event
	 * @type {Object}
	 */
	event = {
		action: null,
		urlchange: null,
	};

	/**
	 * mode
	 * @type {Object}
	 */
	mode = {
		stealth: null,
	};

	/**
	 * helper
	 * @type {Object}
	 */
	helper = {
		createURL: null,
		encodeURI: null,
		location: null,
		Promise: null,
		XRegExp: null,
	};

	/**
	 * promise
	 * @type {Object}
	 */
	promise = {}

	/**
	 * _runRoute
	 * @type {Boolean}
	 */
	_runRoute = true;

	/**
	 * _lastFragment
	 * @type {String}
	 */
	_lastFragment = null;

	/**
	 * routes
	 * @type {Object}
	 */
	_routes = {
		static: {},
		dynamic: {},
		cache: {},
	};

	/**
	 * constructor
	 * @param  {Object} config
	 * @return {Router}
	 */
	constructor(config = {}){

		Object.assign(this, config);
		this._init();

	}

	/**
	 * on
	 * @param  {string} event
	 * @param  {function} handler
	 * @return {Promise}
	 */
	on(type = '', handler = null){

		if(!type){
			throw 'Please pass at least type e.g urlchange, Foo, Bar, ...';
		}

		let [ name, route ] = type.split(' ');
		let promise = this.addRouteListener(name, route, handler);

		return promise;

	}

	/**
	* off
	* @param  {string} event
	* @return {undefined}
	*/
	off(event) {

		this.scope.off(event);

	}

	/**
	 * trigger
	 * @param  {String} event
	 * @param  {Object} options
	 * @return {Undefined}
	 */
	trigger(event = '', params = {}){

		this.scope.trigger(event, params);

	}

	/**
	 * off
	 * @return {Undefined}
	 */
	destroy() {

		this._removeInternalCoreEvents();
		this._removeRegisteredEvents();

	}

	/**
	 * addRouteListener
	 * @param {string} name
	 * @param {string} route
	 * @param {Promise} promise
	 */
	addRouteListener(name, route, handler = null){

		/**
		 * _addRoute is required for:
		 * 1. if route matched then we can take name for triggering event
		 * 2. if router should destroy, see .destroy()
		 */
		if(route && name) {
			this._addRoute(route, name);
		}

		// create promise if handler not exists
		let promise = null;
		if(name && !handler){
			promise = this._addPromise(name);
		}

		this.scope.on(name, event => {

			let params = event.detail || {};

			if(handler){
				handler(params);
			}
			// resolve promise
			this._promiseHandler(name, params);
		});

		return promise;
	}

	/**
	 * _addRoute
	 * @param {string} route
	 * @param {string} name
	 */
	_addRoute(route, name){

		if(this._routes.dynamic[route] || this._routes.static[route]) {
			throw `route: "${route} already exists!"`;
		}

		if(this._isDynamicURL(route)) {
			let regex = this._convertRouteToXRegexExp(route);
			this._routes.dynamic[route] = this._createRouteObject(name, route, regex, 'dynamic');
		} else {
			this._routes.static[route]  = this._createRouteObject(name, route, null,  'static');
		}

	}

	_createRouteObject(name, route, regex = null, type){

		return {
			type: type,
			name: name,
			route: route,
			regex: regex,
			params: null,
			fragment: null,
			cache: false,
		};

	}

	/**
	 * _addPromise
	 * @param {string} name
	 * @return {Promise} promise
	 */
	_addPromise(name) {

		if(!this.promise[name]){
			this.promise[name] = [];
		}

		let promise = this.Promise(resolve => {
			this.promise[name].push(resolve);
		});

		return promise;

	}

	/**
	 * _getRoutes
	 * @return {Object}
	 */
	_getRoutes(type = 'static'){

		return this._routes[type];

	}

	/**
	 * encodeURI
	 * @param  {String} uri
	 * @return {String}
	 */
	encodeURI(uri){

		return this.helper.encodeURI(uri);

	}

	/**
	 * createURL
	 * @param  {String} href
	 * @return {URL} url
	 */
	createURL(href){

		let url = new this.helper.createURL(href);
		url.fragment = url.href.replace(url.origin, '');
		return url;

	}

	/**
	 * Promise
	 * @param  {Function} handler
	 * @return {Promise}
	 */
	Promise(handler=null) {

		if(!handler){
			throw `Please pass a handler function handler(){}!`;
		}

		return new this.helper.Promise(handler);

	}

	/**
	 * XRegExp
	 */
	get XRegExp() {

		return this.helper.XRegExp;

	}

	/**
	 * _init
	 * @return {Undefined}
	 */
	_init(){

		this._bindInternalCoreEvents();

	}

	/**
	 * _bindInternalCoreEvents
	 * @return {Undefined}
	 */
	_bindInternalCoreEvents(){

		this.scope.on(this.event.action, ::this._onAction);
		this.scope.on(this.event.urlchange, ::this._onUrlchange);

	}

	/**
	 * _removeInternalCoreEvents
	 * @return {undefined}
	 */
	_removeInternalCoreEvents(){

		this.scope.off(this.event.action);
		this.scope.off(this.event.urlchange);

	}

	/**
	 * _removeRegisteredEvents
	 * @return {undefined}
	 */
	_removeRegisteredEvents(){

		let allRoutes = Object.assign({}, this._routes.static, this._routes.dynamic);
		for(let route of Object.keys(allRoutes)){

			let { name } = allRoutes[route];
			this.scope.off(name);

		}

	}

	/**
	 * _onAction
	 * @param  {Event} event
	 * @return {undefined}
	 */
	_onAction(event){

		this._preventDefault(event);
		if(!this._runRoute) {
			return;
		}
		this._stopPropagation(event);

		this._applyActionEvent(event);

	}

	/**
	 * _onActionController
	 * @param  {Element} target
	 * @param  {String} type
	 * @return {Undefined}
	 */
	_applyActionEvent( event ){

		let href =  this._getCurrentHref(event);
		let urlObject = this.createURL(href);
		let { fragment } = urlObject;

		if(this._urlFragmentChanged(fragment)) {
			if(this._isDefinedEventAction(event.type)){
				this.pushState(null, null, this.encodeURI(fragment));
			}
			this.scope.trigger(this.event.urlchange, urlObject);
		}
		this._setURLFragment(fragment);

	}

	/**
	 * _isDefinedEventAction
	 * @param  {string} event_type
	 * @return {Boolean} _isDefinedEventAction
	 */
	_isDefinedEventAction(event_type){

		let isDefinedEventAction = event_type === this._getDefinedEventAction();
		return isDefinedEventAction;

	}

	/**
	 * _getCurrentHref
	 * @param  {Event} event
	 * @return {string}
	 */
	_getCurrentHref(event) {

		// extract defined_event_action e.g. "click" from "click a"
		let defined_event_action = this._getDefinedEventAction();
		// check if event is triggered by "click" or triggered by back/forward button and return href
		let href = event.type === defined_event_action ? event.target.href : this.helper.location.href;
		return href;

	}

	/**
	 * _getDefinedEventAction
	 * @return {string} defined_event_action
	 */
	_getDefinedEventAction(){

		let [ defined_event_action ] = this.event.action.split(' ');
		return defined_event_action;

	}

	/**
	 * _urlFragmentChanged
	 * @return {boolean}
	 */
	_urlFragmentChanged(currentFragment){

		let urlFragmentChanged = ( currentFragment !== this._lastFragment );
		return urlFragmentChanged;

	}

	/**
	 * _setFragment
	 * @param {string} fragment
	 * @param {undefined}
	 */
	_setURLFragment(fragment) {

		this._lastFragment = fragment;

	}

	/**
	 * _onUrlchange
	 * @param  {Event} event
	 * @return {Undefined}
	 */
	_onUrlchange(event){

		if(!(event.detail instanceof this.helper.createURL)){
			return;
		}

		let { fragment } = event.detail;
		let matchedURL = this._matchURL(fragment);
		if(matchedURL){
			let { name } = matchedURL;
			matchedURL.URL = event.detail;
			this.scope.trigger(name, matchedURL);
		}

	}

	/**
	 * _matchURL description
	 * @param  {string} fragment
	 * @return {object}
	 */
	_matchURL(fragment, cache = true){

		let matchedURLObject = null;

		// load from cache
		matchedURLObject = this._getRouteCache(fragment);
		if(matchedURLObject && cache){
			return matchedURLObject;
		}

		// match static url
		matchedURLObject = this._matchStaticURL(fragment);
		if(matchedURLObject) {
			return matchedURLObject;
		}

		// match dynamic url
		matchedURLObject = this._matchDynamicURL(fragment);
		if(matchedURLObject) {
			this._addRouteCache(fragment, matchedURLObject);
			return matchedURLObject;
		}

		return null;

	}

	/**
	 * _matchStaticURL
	 * @param  {string} fragment
	 * @return {object}
	 */
	_matchStaticURL(fragment){

		let matchedURLObject = this._getRoutes('static')[fragment] || null;
		if(matchedURLObject) {

			// build matchedURLObject
			matchedURLObject = Object.assign({}, matchedURLObject, { fragment });
		}

		return matchedURLObject;
	}

	/**
	 * _matchDynamicURL
	 * @param  {string} fragment
	 * @return {object}
	 */
	_matchDynamicURL(fragment){

		for(let route of Object.keys(this._routes.dynamic)){

			// parepare datas for matching
			let routeObject = this._routes.dynamic[route];
			// match regex
			let compiledRegex = this.XRegExp(routeObject.regex);
			let matchedRegex = this.XRegExp.exec(fragment, compiledRegex);

			// continue if not matched
			if(matchedRegex === null){
				continue;
			}

			let params = this._normalizeMatchedXRegex(matchedRegex);

			// build matchedURLObject
			let matchedURLObject = Object.assign({}, routeObject, { params, fragment });
			return matchedURLObject;

		}

		return null;

	}

	/**
	 * _normalizeMatchedXRegex
	 * @param  {object} matchedObject
	 * @return {object}
	 */
	_normalizeMatchedXRegex(matchedRegex = {}){

		let params = {};
		for(let attribute in matchedRegex){

			// Skip index, input and numeric attributes.
			// We just want the group named regex
			if(/index|input/.test(attribute)){
				continue;
			} else if(this._isNumeric(attribute)){
				continue;
			}

			let value = matchedRegex[attribute];
			// convert to real number if attribute is numeric
			if(this._isNumeric(value)){
				value = parseFloat(value);
			}
			params[attribute] = value;
		}

		return params;

	}

	/**
	 * _addRouteCache
	 * @param {string} fragment
	 * @param {object} cacheObject
	 */
	_addRouteCache(fragment, cacheObject){

		cacheObject = this._immutable(cacheObject);
		cacheObject.cache = true;
		this._routes.cache[fragment] = cacheObject;

	}

	/**
	 * _immutable
	 * @param  {object} object
	 * @return {object}
	 */
	_immutable(object) {

		return JSON.parse(JSON.stringify(object));

	}

	/**
	 * _getRouteCache
	 * @param  {string} fragment
	 * @return {object} cacheRouteObject
	 */
	_getRouteCache(fragment) {

		return this._routes.cache[fragment] || null;

	}

	/**
	 * _promiseHandler
	 * @param  {string} type
	 * @param  {Evemt} event
	 * @return {undefined}
	 */
	_promiseHandler(type, event){

		if(!this.promise[type]){
			return;
		}

		let resolve;
		// promise can resolved only once therefore shift()
		while((resolve = this.promise[type].shift()) !== undefined){
			resolve(event);
		}

	}

	/**
	 * _convertRouteToXRegexExp
	 * @param  {string} url
	 * @return {XRegExp-String} url
	 */
	_convertRouteToXRegexExp(url = ''){

		let variableURLRegex = this.XRegExp('{{(?<variableURL>[a-z]+)}}', 'g');
		url = url.replace(/[\/|+*?.()]/g, '\\$&');
		url = this.XRegExp.replace(url, variableURLRegex, '(?<${variableURL}>[\\d\\w?()|{}_.,-]+)');

		return url;

	}

	/**
	 * _isDynamicURL
	 * @param  {string} url
	 * @return {Boolean} _isDynamicURL;
	 */
	_isDynamicURL(url = '') {

		let isDynamicURL = /{{[a-z]+}}/.test(url);
		return isDynamicURL;

	}

	/**
	 * _preventDefault
	 * @param  {Event} event
	 * @return {undefined}
	 */
	_preventDefault(event){

		if(event instanceof Event){
			event.preventDefault();
		}

	}

	/**
	 * _stopPropagation
	 * @param  {Event} event
	 * @return {undefined}
	 */
	_stopPropagation(event){

		if(this.mode.stealth && event instanceof Event){
			event.stopPropagation();
		}

	}

	/**
	 * _isNumeric
	 * @param  {string|number} value
	 * @return {Boolean}
	 */
	_isNumeric(value) {

		return /^[+-]?\d+(\.\d+)?$/.test(value);

	}

	/**
	 * _constructURL
	 * @param  {string} route
	 * @params {object} params
	 * @return {string}
	 */
	_constructURL(route = '', params){

		if(!route){
			throw 'Please pass at least route';
		}

		let routeObject = this.which(route);
		if(routeObject === null) {
			throw `route: ${route} does not exists!`;
		}

		let url = null;
		if(routeObject && routeObject.type === 'static'){
			url = this._constructStaticURL(routeObject.route);
		}
		if(routeObject && routeObject.type === 'dynamic'){
			url = this._constructDynamicURL(routeObject.route, params);
		}

		return url;

	}

	/**
	 * _constructStaticURL
	 * @param  {object} routeObject
	 * @return {string} staticUrl
	 */
	_constructStaticURL(route = ''){

		let staticURL = route;
		return staticURL;

	}

	/**
	 * _constructDynamicURL
	 * @param  {object} routeObject
	 * @param  {object} params
	 * @return {string} url
	 */
	_constructDynamicURL(route = '', params = {}){

		let curlyBracketsRegex = /\{\{|\}\}/;
		let url = route;

		for(let param of Object.keys(params)){
			url = url.replace(`{{${param}}}`, () => params[param]);
		}

		if(curlyBracketsRegex.test(url)){
			throw `
				Someting gone wrong. Cant resolve passed params: "${JSON.stringify(params)}".
				Generated url: "${url}" by method _constructDynamicURL;
			`;
		}

		return url;

	}

	/**
	 * whoami
	 * @param  {String} path
	 * @return {object|null}
	 */
	whoami(url){

		let matchedUrlObject =  this._matchURL(url, false);
		return matchedUrlObject;

	}

	/**
	 * which
	 * @param  {string} name
	 * @return {object|null}
	 */
	which(name){

		let allRoutes = Object.assign({}, this._routes.static, this._routes.dynamic);
		for(let route of Object.keys(allRoutes)){
			let routeObject = allRoutes[route];
			if(routeObject.name === name){
				return routeObject;
			}
		}

		return null;

	}

	/**
	 * constructURL
	 * @param  {String} route
	 * @param  {Object} params
	 * @return {String}
	 */
	constructURL(route, params = {}){

		let url = this._constructURL(route, params);
		return url;

	}

	/**
	 * redirect
	 * @return {undefined}
	 */
	go(route, params = {}){

		let url = this._constructURL(route, params);
		this.pushState(null, null, this.encodeURI(url));

	}

	/**
	 * redirect
	 * @param {string} url
	 * @param {boolean} soft
	 * @return {undefined}
	 */
	redirect(url, soft = true){

		let encodedURI = this.encodeURI(url);

		if(soft){
			this.pushState(null, null, this.encodeURI(encodedURI));
		} else {
			this.location.href = encodedURI;
		}

	}

	/**
	 * start
	 * @return {undefined}
	 */
	start(){

		this._runRoute = true;

	}

	/**
	 * stop
	 * @return {Undefined}
	 */
	stop(){

		this._runRoute = false;

	}
}
