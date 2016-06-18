
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

	promise = {}

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
		compiled: {},
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
			this._routes.dynamic[route] = this._buildRouteObject(name, route);
		} else {
			this._routes.static[route] = this._buildRouteObject(name, route);
		}

	}

	_buildRouteObject(name, route){

		return {
			name,
			route,
			params: {},
			fragment: null,
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

		// createURL === URL object
		if(event.detail instanceof this.helper.createURL){

			let { fragment } = event.detail;
			let matchedURLObject = this._matchURL(fragment);
			let { name, params } = matchedURLObject;
			if(name !== null){
				this.scope.trigger(name, matchedURLObject);
			}

		}

	}

	/**
	 * _matchURL description
	 * @param  {string} fragment
	 * @return {object}
	 */
	_matchURL(fragment){

		let matchedURLObject = {
			fragment: fragment,
			route: null,
			name: null,
			params: {},
		};
		let name = null;

		// static url
		name = this._getRoutes('static')[fragment];
		if(name){
			return matchedURLObject = Object.assign(matchedURLObject, { name });
		}

		// compiled url
		name = this._getRoutes('compiled')[fragment];
		if(name){
			return matchedURLObject = Object.assign(matchedURLObject, { name });
		}

		// try to match from _routes

		return matchedURLObject;

	}

	/**
	 * _promiseHandler
	 * @param  {string} type
	 * @param  {Evemt} event
	 * @return {undefined}
	 */
	_promiseHandler(type, event){

		if(this.promise[type]){

			let resolve;
			// promise can resolved only once therefore shift()
			while((resolve = this.promise[type].shift()) !== undefined){
				resolve(event);
			}

		}

	}

	/**
	 * _convertURLToXRegexExp
	 * @param  {string} url
	 * @return {XRegExp-String} url
	 */
	_convertURLToXRegexExp(url = ''){

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
	 * recognize
	 * @param  {String} path
	 * @return {object}
	 */
	recognize(url){

		let matchedUrlObject =  this._matchURL(url);
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

	}

	/**
	 * stop
	 * @return {Undefined}
	 */
	stop(){

	}
}
