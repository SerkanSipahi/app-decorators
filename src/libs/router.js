
class Router {

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
	 * routes
	 * @type {object}
	 */
	routes = {};

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
		static: {
			pathname: {},
			search: {},
			hash: {}
		},
		dynamic: {
			pathname: {},
			search: {},
			hash: {}
		},
		cache: {}
	};

	/**
	 * tmpDomain
	 * @type {string}
     */
	tmpDomain = '';

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

		if(!event) {
			throw `No event passed`;
		}

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

		// bind bindObject if exsits
		if(this.bind){
			handler = this.bind::handler;
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

		if(!this._isValidRoute(route)){
			throw `
				Passed "${route}" is not valid. Please
				pass only pathname, search or hash.
			`;
		}

		let urlpart = this._getURLType(route);

		if(this._routes.dynamic[urlpart][route] || this._routes.static[urlpart][route]) {
			throw `route: "${route}" related to urlpart "${urlpart}" already exists!`;
		}

		if(this._isDynamicURL(route)) {
			let regex = this._convertRouteToXRegexExp(route);
			let args = [ name, route, regex, 'dynamic', urlpart ];
			this._routes.dynamic[urlpart][route] = this._createRouteObject(...args);
		} else {
			let args = [ name, route, null,  'static', urlpart ];
			this._routes.static[urlpart][route] = this._createRouteObject(...args);
		}

	}

	/**
	 *
	 * @param name
	 * @param route
	 * @param regex
	 * @param type
	 * @param urlpart
	 * @returns {object}
     * @private
     */
	_createRouteObject(name, route, regex = null, type, urlpart){

		return {
			type,
			name,
			route,
			urlpart,
			regex,
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
		this._initRoutes();

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

		let allParts = Object.assign({}, this._routes.static, this._routes.dynamic);
		for(let part of Object.keys(allParts)){

			let routes = allParts[part];
			for(let route of Object.keys(routes)){
				let { name } = routes[route];
				this.scope.off(name);
			}
		}
	}

	/**
	 * _initRoutes
	 * @return {undefined}
	 */
	_initRoutes(){

		if(!this.routes){
			return;
		}

		for(let route of Object.keys(this.routes)){

			let handler = this.routes[route];
			if(this.bind){
				handler = this.bind::handler;
			}
			this.on(route, handler);

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
	 * @param  {Event} event
	 * @return {Undefined}
	 */
	_applyActionEvent( event ){

		let href =  this._getCurrentHref(event);
		let urlObject = this.createURL(href);
		let { fragment } = urlObject;

		let { changed, changepart } = this._diffFragment(fragment, this._lastFragment);

		if(changed) {

			Object.assign(urlObject, { changepart });

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
	 * _diffFragment
	 * @return {object} diff
	 */
	_diffFragment(currentFragment, lastFragment){

		let diff = {
			changed: false,
			changepart: []
		};

		diff.changed = currentFragment !== lastFragment || lastFragment === null;

		let currentFragmentParts = this._convertFragmentToParts(currentFragment);
		let lastFragmentParts = this._convertFragmentToParts(lastFragment);
		let diffParts = this._diffFragmentParts(currentFragmentParts, lastFragmentParts);

		diff.changepart = diffParts;

		return diff;

	}

	/**
	 * _convertFragmentToParts
	 * @param fragment
	 * @returns {fragmentObject}
     * @private
     */
	_convertFragmentToParts(fragment = '') {

		let urlObject = this.createURL(`${this.tmpDomain}${fragment}`);

		return {
			pathname: urlObject.pathname,
			search: urlObject.search,
			hash: urlObject.hash
		};
	}

	/**
	 * _diffFragmentParts
	 * @param ...args
	 * @private
     */
	_diffFragmentParts(fragment1, fragment2){

		let parts = [];
		for(let part of Object.keys(fragment1)){
			if(fragment1[part] === fragment2[part]){
				continue;
			}
			parts.push(part);
		}

		return parts;

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
	 * @param  {boolean} cache
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
	_matchStaticURL(fragment, part){

		let matchedURLObject = this._routes.static[part][fragment] || null;
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
	 * _isValidRoute
	 * @param route
	 * @returns {boolean}
     * @private
     */
	_isValidRoute(route) {

		let result = !!this._getURLType(route);
		return result;

	}

	/**
	 * _getURLType
	 * @param  {string} route
	 * @return {Boolean} validRoute
	 */
	_getURLType(route = ''){

		let { pathname, search, hash } = this.createURL(`${this.tmpDomain}${route}`);
		let validRoute = null;

		// only "/"
		if(!pathname[1] && !search && !hash){
			validRoute = 'pathname';
		}
		// only pathname e.g. /a/b.html
		else if(pathname[1] && !search && !hash){
			validRoute = 'pathname';
		}
		// only search e.g. ?a=1&b=2
		else if(!pathname[1] && search && !hash){
			validRoute = 'search';
		}
		// only hash e.g. #myhash
		else if(!pathname[1] && !search && hash){
			validRoute = 'hash';
		}
		// not valid route e.g. /a/b.html?a=1&b2
		else {
			validRoute = null;
		}

		return validRoute;

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

		let href = this.helper.location.href;
		let { fragment } = this.createURL(href);
		let routeObject = this.whoami(fragment);

		if(routeObject) {
			this.trigger(routeObject.name);
		}


	}

	/**
	 * stop
	 * @return {Undefined}
	 */
	stop(){

		this._runRoute = false;

	}
}

export {
	Router
};
