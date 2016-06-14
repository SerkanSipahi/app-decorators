
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
	_routes = {};

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

		let [ eventName, route ] = type.split(' ');
		let promise = this.addRouteListener(eventName, route, handler);

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
		for(let event of Object.keys(this._events)){
			this.scope.off(event);
		}
	}
	/**
	 * addRouteListener
	 * @param {string} eventName
	 * @param {string} route
	 * @param {Promise} promise
	 */
	addRouteListener(eventName, route, handler = null){

		// add route
		// is required for: if route matched then we
		// can take eventType for triggering
		this.addRoute(eventName, route);

		// add event, its required if we want to destroy the router
		this.addEvent(eventName);

		// create promise if handler not exists
		let promise = null;
		if(!handler){

			if(!this.promise[eventName]){
				this.promise[eventName] = [];
			}

			promise = this.Promise(resolve => {
				this.promise[eventName].push(resolve);
			});

		}

		this.scope.on(eventName, event => {

			let params = event.detail || {};

			if(handler){
				handler(params);
			}
			// resolve promise
			this._promiseHandler(eventName, params);
		});

		return promise;
	}

	/**
	 * addRoute
	 * @param {string} eventName
	 * @param {string} route
	 */
	addRoute(eventName, route){

		if(route && !this._routes[eventName]) {
			this._routes[route] = eventName;
		}

	}

	/**
	 * addEvent
	 * @param {undefined} type
	 */
	addEvent(eventName){

		if(!this._events[eventName]){
			this._events[eventName] = null;
		}

	}

	/**
	 * getRoutes
	 * @return {Object}
	 */
	getRoutes(){
		return this._routes;
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
	 * _init
	 * @return {Undefined}
	 */
	// sollte in start umbenannt werden
	_init(){

		this._bindEvents();

	}

	/**
	 * _bindEvents
	 * @return {Undefined}
	 */
	_bindEvents(){

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
		// check if event triggered "click" or triggered by back/forward button
		let urlObject = this.createURL(
			event.type === event_action_type ? event.target.href : this.helper.location.href
		);

		if(urlObject.fragment !== this._lastFragment) {
			if(event.type === event_action_type){
				this.pushState(null, null, this.encodeURI(urlObject.fragment));
			}
			this.scope.trigger(this.event.urlchange, urlObject);
		}

		this._lastFragment = urlObject.fragment;

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
			let { eventName, params } = this._matchURL(fragment);
			if(eventName){
				this.scope.trigger(eventName, params);
			}

		}

	}

	/**
	 * _matchURL description
	 * @param  {string} fragment
	 * @return {object}
	 */
	_matchURL(fragment){

		let matchedObject = { params: {}, eventName: null };

		// bestcase (static url)
		let eventName = this._routes[fragment];
		if(eventName){
			matchedObject = { eventName };
		} else {
			// if matched, then add dynamic url to white list
		}

		return matchedObject;

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
