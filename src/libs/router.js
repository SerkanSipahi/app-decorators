
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
	trigger(event = '', options = null){

		this.scope.trigger(event, options);

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
			this._routes.dynamic[route] = this._createRouteObject(name, route, regex);
		} else {
			this._routes.static[route]  = this._createRouteObject(name, route);
		}

	}

	_createRouteObject(name, route, regex = null){

		return {
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
		let urlFragment = urlObject.fragment;

		if(this._urlFragmentChanged(urlFragment)) {
			if(this._isDefinedEventAction(event.type)){
				this.pushState(null, null, this.encodeURI(urlFragment));
			}
			this.scope.trigger(this.event.urlchange, urlObject);
		}
		this._setURLFragment(urlFragment);

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

			// resolve reference
			matchedURLObject = JSON.parse(JSON.stringify(matchedURLObject));

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

			// return if not matched
			if(matchedRegex === null){
				continue;
			}

			// convert matched to object-object
			let params = {};
			delete matchedRegex.index;
			delete matchedRegex.input;
			for(let param in matchedRegex){
				params[param] = matchedRegex[param];
			}

			// resolve reference
			routeObject = JSON.parse(JSON.stringify(routeObject));

			// build matchedURLObject
			let matchedURLObject = Object.assign(routeObject, { params }, { fragment });
			return matchedURLObject;

		}

		return null;

	}

	/**
	 * _addRouteCache
	 * @param {string} fragment
	 * @param {object} cacheObject
	 */
	_addRouteCache(fragment, cacheObject){

		cacheObject = JSON.parse(JSON.stringify(cacheObject));
		cacheObject.cache = true;
		this._routes.cache[fragment] = cacheObject;

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
		url = url.replace(/\//g, '\\/');
		url = this.XRegExp.replace(url, variableURLRegex, '(?<${variableURL}>.*?)');

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
	 * whoami
	 * @param  {String} path
	 * @return {object}
	 */
	whoami(url){

		let matchedUrlObject =  this._matchURL(url, false);
		return matchedUrlObject;

	}

	/**
	 * constructURL
	 * @param  {String} route
	 * @param  {Object} params
	 * @return {String}
	 */
	constructURL(route, params = {}){

	}

	/**
	 * redirect
	 * @return {undefined}
	 */
	redirect(){

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
