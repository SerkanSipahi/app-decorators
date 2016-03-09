
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
	 * shadowEvent
	 * @type {Boolean}
	 */
	shadowEvent = true;

	/**
	 * _routes
	 * @type {Object}
	 */
	_routes = null;

	/**
	 * _lastFragment
	 * @type {String}
	 */
	_lastFragment = null;

	/**
	 * EVENT_URLCHANGE
	 * @type {String}
	 */
	static EVENT_URLCHANGE = 'urlchange';

	/**
	 * constructor
	 * @param  {Object} config
	 * @return {Router}
	 */
	constructor({ config }){

		this._routes = config.routes;

		this.pushState = config.pushState;
		this.replaceState = config.replaceState;
		this.forward = config.forward;
		this.back = config.back;
		this.forceUrlchange = config.forceUrlchange || false;
		this.shadowEvent = true;

		this._scope_root = config.scope_root;
		this._event_root = config.event_root;

		this._event_popsate = config.event_popsate;
		this._scope_popstate = config.scope_popstate;

		this._event_urlchange = config.event_urlchange || Router.EVENT_URLCHANGE;
		this._scope_urlchange = config.scope_urlchange;

		Router.URLResolver = config.URLResolver;
		Router.encodeURI = config.encodeURI;

		this._init();

	}

	/**
	 * newUrl
	 * @param  {String} href
	 * @return {URL} url
	 */
	static newUrl(href){

		let url = new Router.URLResolver(href);
		url.fragment = url.href.replace(url.origin, '');
		return url;

	}

	/**
	 * on
	 * @param  {String} type
	 * @param  {Function} handler
	 * @param  {Function} handler
	 * @return {Promise}
	 */
	on(type, ...args){

		return { then: ::this.then };

	}

	/**
	 * addRoute
	 * @param {String} routename
	 * @param {String|RegExp} route
	 */
	addRoute(routename, route, remote){

		return { then: ::this.then };
	}

	/**
	 * trigger
	 * @param  {String} event
	 * @param  {Object} options
	 * @return {Undefined}
	 */
	trigger(event = '', options = null){

		let _scope = this[`_scope_${event}`];
		if(!_scope){
			throw `Allowed events: urlchange, ${(this._route_events || []).join(', ')}`;
		}
		_scope.trigger(event, options);

	}


	/**
	 * destroy
	 * @return {Undefined}
	 */
	destroy() {

		this._scope_root.removeEvent(this._event_root);
		this._scope_popstate.removeEvent(this._event_popsate);
		this._scope_urlchange.removeEvent(this._event_urlchange);
		// TODO:
		// clear history records, etc
	}


	/**
	 * _init
	 * @return {Undefined}
	 */
	// sollte in start umbenannt werden
	_init(){

		this._bindInternalEvents();
		this._bindRoutes();

	}

	/**
	 * _bindInternalEvents description
	 * @return {Undefined}
	 */
	_bindInternalEvents(){

		this._scope_root.on(this._event_root, ::this._forwardingOnIntervalEvent);
		this._scope_popstate.on(this._event_popsate, ::this._forwardingOnIntervalEvent);
		this._scope_urlchange.on(this._event_urlchange, ::this._onUrlchange);

	}

	/**
	 * _forwardingOnIntervalEvent
	 * @param  {Element} target
	 * @param  {String} type
	 * @return {Undefined}
	 */
	_forwardingOnIntervalEvent( event ){

		event.preventDefault ? event.preventDefault() : null;
		this.shadowEvent ? event.stopPropagation() : null;

		let [ event_root_type ] = this._event_root.split(' ');
		let urlObject = Router.newUrl(
			event.type === event_root_type ? event.target.href : location.href
		);

		if(urlObject.fragment !== this._lastFragment) {
			if(event.type === event_root_type){
				this.pushState(null, null, Router.encodeURI(urlObject.fragment));
			}
			this._scope_urlchange.trigger(this._event_urlchange, urlObject);
		}

		this._lastFragment = urlObject.fragment;

	}

	/**
	 * _onUrlchange
	 * @param  {Event} event
	 * @return {Undefined}
	 */
	_onUrlchange({ detail }){

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
	 * [then description]
	 * @param  {Function} callback [description]
	 * @return {[type]}            [description]
	 */
	then(callback){

		return new Promise(() => {

		});

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
