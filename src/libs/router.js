
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
	 * scope
	 * @type {Object}
	 */
	scope = {
		host: null,
		urlchange: null,
	};

	/**
	 * event
	 * @type {Object}
	 */
	event = {
		host: null,
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

		if(!event){
			throw 'Please pass at least event e.g urlchange, Foo, Bar, ...';
		}

		let handler = null;
		let rule = null;
		let classof_arg2 = Object.classof(arg_2);
		let classof_arg3 = Object.classof(arg_3);

		if(event && classof_arg2 === 'Function' && classof_arg3 === 'Undefined'){
			handler = arg_2;
		}
		if(event && classof_arg2 === 'String' && classof_arg3 === 'Function'){
			rule = arg_2;
			handler = arg_3;
		}

		if(handler === null){
			throw 'You forget to pass the handler';
		}

		// if(Object.classof(this._scope[event]) !== 'Array'){
		// 	this._scope[event] = [];
		// }
		let promise = this.createPromise(::this._onPromiseResolved);
		// this._scope[event].push({ rule, handler, promise });

		return promise;

	}

	/**
	 * createPromise
	 * @param  {Function} handler
	 * @return {Promise}
	 */
	createPromise(handler) {
		return new Promise(handler);
	}

	/**
	 * trigger
	 * @param  {String} event
	 * @param  {Object} options
	 * @return {Undefined}
	 */
	trigger(event = '', options = null){

		let _scope = this._scope[event];
		if(!_scope){
			throw `Allowed events: urlchange, ${(this._routes || []).join(', ')}`;
		}

		this._scope[this._event].trigger(event, options);

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
		this.listener.host.removeEvent(this.event.host);
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

		this.listener.host.on(this.event.host, ::this._onAction);
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

		let [ event_host_type ] = this.event.host.split(' ');
		let urlObject = this.resolveURL(
			event.type === event_host_type ? event.target.href : this.helper.location.href
		);

		if(urlObject.fragment !== this._lastFragment) {
			if(event.type === event_host_type){
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
	_onUrlchange( event ){
		console.log('_onUrlchange', event, event.detail.fragment);
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
