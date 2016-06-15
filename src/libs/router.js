
export default class Router {

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
	 * _lastEvent
	 * @type {String}
	 */
	_lastEvent = null;

	/**
	 * _lastRoute
	 * @type {String|RegExp}
	 */
	_lastRoute = null;

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
	 * _events description
	 * @type {Object}
	 */
	_events = {};

	/**
	 * constructor
	 * @param  {Object} config
	 * @return {Router}
	 */
	constructor(config){

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

		// remove internal events
		this.scope.off(this.event.action);
		this.scope.off(this.event.urlchange);

		// remove registered events
		let allRoutes = Object.assign({}, this._routes.static, this._routes.dynamic);
		for(let route of Object.keys(allRoutes)){

			let event = allRoutes[route];
			this.scope.off(event);

		}

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
		this._addRoute(route, name);

		// create promise if handler not exists
		let promise = null;
		if(!handler){
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

		if(this._isDynamicURL(route)) {
			if(!this._routes.dynamic[route]){
				this._routes.dynamic[route] = name;
			}
		} else {
			if(!this._routes.static[route]){
				this._routes.static[route] = name;
			}
		}

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
	 * getRoutes
	 * @return {Object}
	 */
	getRoutes(type = 'static'){

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
	// sollte in start umbenannt werden
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
	 * _onAction
	 * @param  {Element} target
	 * @param  {String} type
	 * @return {Undefined}
	 */
	_onAction( event ){

		// prevent default behavior if click a-tag
		if(event instanceof Event){
			event.preventDefault();
			this.shadowEvent ? event.stopPropagation() : null;
		}

		// extract event_action_type e.g. "click" from "click a"
		let [ event_action_type ] = this.event.action.split(' ');
		// check if event triggered by "click" or triggered by back/forward button
		// and then build an urlObject
		let urlObject = this.createURL(
			event.type === event_action_type ? event.target.href : this.helper.location.href
		);

		if(this._urlFragmentChanged(urlObject.fragment)) {
			if(event.type === event_action_type){
				this.pushState(null, null, this.encodeURI(urlObject.fragment));
			}
			this.scope.trigger(this.event.urlchange, urlObject);
		}
		this._setURLFragment(urlObject.fragment);

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
			let { name, params } = this._matchURL(fragment);
			if(name !== null){
				this.scope.trigger(name, params);
			}

		}

	}

	/**
	 * _matchURL description
	 * @param  {string} fragment
	 * @return {object}
	 */
	_matchURL(fragment){

		let matchedURLObject = { name: null, params: {} };

		// bestcase (static url)
		let name = this._routes.static[fragment];
		if(name){
			matchedURLObject = Object.assign(matchedURLObject, { name });
		} else {
			// if matched, then add dynamic url to white list
		}

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
	 * redirect
	 * @return {undefined}
	 */
	redirect(){

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

	/**
	 * var result2 = router.recognize("/product/detail/1");
	 * result2 === { handler: showPost, params: { id: "1" }, name: 'product::detail'};
	 *
	 * @param  {String} path
	 */
	recognize(path){

	}
}
