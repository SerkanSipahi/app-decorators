
export default class Router {

	/**
	 * routes
	 * @type {Object}
	 */
	routes = null;

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

		// if passed 2 arguments e.g 'urlchange', handler
		if([event, ...args].length === 2) {

			if(!this.listener[event]){
				throw `Event: "${event} is not allowed! Allowed is: ${this.event.urlchange}"`;
			}
			this.handler[event].push({ handler, promise });

		} else {
			// if route
		}


		return promise;

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
	 * trigger
	 * @param  {String} event
	 * @param  {Object} options
	 * @return {Undefined}
	 */
	trigger(event = '', options = null){

		if(!this.listener[event]){
			throw `Event: "${event} is not allowed! Please use: ${this.event.urlchange}"`;
		}

		this.listener[event].trigger(this.event[event], options);

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
	 * destroy
	 * @return {Undefined}
	 */
	destroy() {
		this.listener.action.removeEvent(this.event.action);
		this.listener.urlchange.removeEvent(this.event.urlchange);
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

		this.listener.action.on(this.event.action, ::this._onAction);
		this.listener.urlchange.on(this.event.urlchange, ::this._onUrlchange);

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
			this.listener.urlchange.trigger(this.event.urlchange, urlObject);
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
	 * remove route
	 * @return {Undefined}
	 */
	removeEvent(){

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
