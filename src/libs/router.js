
// internal libs
import Eventhandler from './eventhandler';

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
	 * _eventHandler
	 * @type {Eventhandler}
	 */
	_eventHandler = null;

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
			EventHandler: Eventhandler,
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
		this._popstateEventHandler = EventHandler.create({ element: window });
		this._clickEventHandler = EventHandler.create({ element: document.body });
		this._urlchangedEventHandler = EventHandler.create({ element: window });

		this._pushState = pushState;
		this._replaceState = replaceState;
		this._eventHandler = eventHandler;
		this._routes = routes;

		this._init();

	}

	/**
	 * onUrlchanged
	 * @param  {Object} urlchanged
	 * @return {Undefined}
	 */
	onUrlchanged({ urlchanged }) {

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
	 * _bindInternalEvents description
	 * @return {Undefined}
	 */
	_bindInternalEvents(){

		this._popstateEventHandler.on('popstate', (e) => ::this._forwardingOnIntervalEvent);
		this._clickEventHandler.on('click a', (e) => ::this._forwardingOnIntervalEvent);
		this._urlchangedEventHandler.on('urlchange', (e) => ::this.onUrlstate);

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

		let urlObject = this._getUrlObject(document.location.href);

		if(type === 'click') {
			target.preveneDefault();
			this._pushState(null, null, encodeURI(urlObject.fragment));
		}
		
		this._urlchangedEventHandler.trigger('urlchange', urlObject);

	}

	/**
	 * _getUrlObject
	 * @param  {String} href
	 * @return {URL} url
	 */
	_getUrlObject(href){

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
