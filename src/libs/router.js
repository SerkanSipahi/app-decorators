
export default class Router {

	/**
	 * routes
	 * @type {Object}
	 */
	routes = {};

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
		URLResolver: null,
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
	on(type = null, handler = null){

		if(!type){
			throw 'Please pass at least type e.g urlchange, Foo, Bar, ...';
		}

		// keep event types
		!this._events[type] ? this._events[type] = null : null

		let promise = null;
		if(!handler){

			if(!this.promise[type]){
				this.promise[type] = [];
			}

			promise = this.Promise((resolve, reject) => {
				this.promise[type].push(resolve);
			});
		}

		this.scope.on(type, event => {
			// call handler if passed
			if(handler){
				handler(event);
			}
			// resolve promise
			this._promiseHandler(type, event);
		});

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

		if(!this.event[event]){
			throw `Event: "${event} is not allowed! Please use: ${this.event.urlchange}"`;
		}

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
	 * encodeURI
	 * @param  {String} uri
	 * @return {String}
	 */
	encodeURI(uri){
		return this.helper.encodeURI(uri);
	}


	/**
	 * resolveURL
	 * @param  {String} href
	 * @return {URL} url
	 */
	resolveURL(href){

		let url = new this.helper.URLResolver(href);
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
		this._bindRoutes();

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

		if(event instanceof Event){
			event.preventDefault();
			this.shadowEvent ? event.stopPropagation() : null;
		}

		let [ event_action_type ] = this.event.action.split(' ');
		let urlObject = this.resolveURL(
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
			// promise can resolved only once there shift()
			while((resolve = this.promise[type].shift()) !== undefined){
				resolve(event);
			}

		}

	}

	/**
	 * _bindRoutes description
	 * @param  {Object} routes
	 * @return {Undefined}
	 */
	_bindRoutes(routes){

		if(routes) {
			for(let route in routes) {
				if(!routes.hasOwnProperty(route)){
					return;
				}
				this.addRoute(/*routename, routepath, handler*/);
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
