
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
	 * listner
	 * @type {Object}
	 */
	listner = {
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
	 * handler
	 * @type {Object}
	 */
	handler = {
		urlchange: [],
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
	 * @param  {String} event
	 * @param  {Function} handler
	 * @param  {Function} handler
	 * @return {Promise}
	 */
	on(event = null, ...args){

		let [ arg_2, arg_3 ] = args;
		let handler = null;
		let rule = null;
		let classof_arg2 = Object.classof(arg_2);
		let classof_arg3 = Object.classof(arg_3);

		if(!event){
			throw 'Please pass at least event e.g urlchange, Foo, Bar, ...';
		}

		// generic event e.g. urlchange
		if(event && classof_arg2 === 'Function' && classof_arg3 === 'Undefined'){
			handler = arg_2;
		}
		// if route event
		if(event && classof_arg2 === 'String' && classof_arg3 === 'Function'){
			rule = arg_2;
			handler = arg_3;
		}
		if(handler === null){
			throw 'You forget to pass the handler';
		}

		let promise = this.createPromise(::this._onPromiseResolved);

		// if passed 2 arguments e.g .on('urlchange', handler)
		if([event, ...args].length === 2) {

			if(!this.event[event]){
				throw `Event: "${event} is not allowed! Allowed is: ${this.event.urlchange}"`;
			}
			this.scope.on(event, handler);

		}
		// if passed 3 arguments e.g .on('Routename', '/a/{{ id }}', handler)
		else {

		}

		return promise;

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

		this.scope.trigger(this.event[event], options);

	}

	/**
	 * off
	 * @return {Undefined}
	 */
	off() {
		this.scope.off(this.event.action);
		this.scope.off(this.event.urlchange);
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
	 * createPromise
	 * @param  {Function} handler
	 * @return {Promise}
	 */
	createPromise(handler=null) {

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
		// call registered internal events e.g. router.on('urlchange', handler);
		this._callRegisteredInternalEvents(event);

	}

	/**
	 * _callRegisteredInternalEvents
	 * @return {Undefined}
	 */
	_callRegisteredInternalEvents(event){

		// if has length its automatically handler and promise available
		if(!this.handler.urlchange.length){
			return;
		}

		for(let { handler, promise } of this.handler.urlchange){
			// call callback handler
			handler.call(this, event);
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
				this.on(/*routename, routepath, handler*/);
			}
		}

	}

	/**
	 * [_onPromiseResolved description]
	 * @param  {Function} resolve
	 * @param  {Function} reject
	 * @return {Undefined}
	 */
	_onPromiseResolved(resolve, reject) {

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
