
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
	_pushState = null;

	/**
	 * _replaceState()
	 * @type {History}
	 */
	_replaceState = null;

	/**
	 * _routes
	 * @type {Object}
	 */
	_routes = null;

	/**
	 * _run
	 * @type {Boolean}
	 */
	_run = false;

	/**
	 * _windowEventhandler
	 * @type EventHandler
	 */
	_windowEventhandler;

	/**
	 * _bodyEventhandler
	 * @type EventHandler
	 */
	_bodyEventhandler;

	/**
	 * Create an instance of Router Class
	 * @param  {Object} config
	 * @return {Router} router
	 */
	static create({ routes }){

		let router = new Router({
			routes: routes,
			forward: ::history.forward,
			back: ::history.back,
			pushState: ::history.pushState,
			replaceState: ::history.replaceState,
			EventHandler: config.config.Eventhandler,
		});

		return router;

	}

	/**
	 * constructor
	 * @param  {Object} routes
	 * @param  {Eventhandler} eventhandler
	 * @param  {History} pushState
	 * @param  {History} replaceState
	 * @param  {History} forward
	 * @param  {History} back
	 * @return {Router}
	 */
	constructor({ routes, EventHandler, pushState, replaceState, forward, back }){

		// public
		Object.assign(this, { forward, back });

		// private
		this._windowEventhandler = EventHandler.create({ element: window });
		this._bodyEventhandler = EventHandler.create({ element: document.body });

		this._pushState = pushState;
		this._replaceState = replaceState;
		this._routes = routes;

		this._init();

	}

	/**
	 * on
	 * @param  {String} routename
	 * @param  {String} route
	 * @param  {Function} handler
	 * @return {Undefined}
	 */
	on(routename, route, handler){

	}

	/**
	 * remove route
	 * @return {Undefined}
	 */
	remove(){

	}

	/**
	 * redirect
	 * @return {undefined}
	 */
	redirect(){

	}

	constructURL(rouete, params = {}){

	}

	/**
	 * start
	 * @return {undefined}
	 */
	start(){
		this._run = true;
	}

	/**
	 * stop
	 * @return {Undefined}
	 */
	stop(){
		this._run = false;
	}

	/**
	 * var result2 = router.recognize("/product/detail/1");
	 * result2 === { handler: showPost, params: { id: "1" }, name: 'product::detail'};
	 *
	 * @param  {String} path
	 */
	recognize(path){

	}

	/**
	 * _init
	 * @return {Undefined}
	 */
	_init(){

		this._bindInternalEvents();
		this._bindRoutes(this._routes);

	}

	/**
	 * onUrlchanged
	 * @param  {Object} urlchanged
	 * @return {Undefined}
	 */
	_onUrlchange({ urlchanged }) {

	}

	/**
	 * _bindInternalEvents description
	 * @return {Undefined}
	 */
	_bindInternalEvents(){

		this._bodyEventhandler.on('click a', ::this._forwardingOnIntervalEvent);
		this._windowEventhandler.on('popstate', ::this._forwardingOnIntervalEvent);

		this._windowEventhandler.on('urlchange', ::this._onUrlchange);

	}

	/**
	 * _removeInternalEvents
	 * @return {[type]}
	 */
	_removeInternalEvents(){


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
	 * _forwardingOnIntervalEvent
	 * @param  {Element} target
	 * @param  {String} type
	 * @return {Undefined}
	 */
	_forwardingOnIntervalEvent({ target, type }){

		let urlObject = Router.newUrl(document.location.href);

		if(type === 'click') {
			target.preveneDefault();
			this._pushState(null, null, encodeURI(urlObject.fragment));
		}

		this._urlchangedEventHandler.trigger('urlchange', urlObject);

	}

	/**
	 * newUrl
	 * @param  {String} href
	 * @return {URL} url
	 */
	static newUrl(href){

		let url = new URL(href);
		url.fragment = url.href.replace(url.origin, '');

		return url;

	}

	/**
	 * _matchRoute description
	 * @return {Boolean}
	 */
	_matchedRoute(){

	}

}
