
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
			eventHandler: new Eventhandler(),
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
	 * @return {Undefined}
	 */
	constructor({ routes, eventHandler, pushState, replaceState, forward, back }){

		// public
		Object.assign(this, { forward, back });

		// private
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
	 * start
	 * @return {undefined}
	 */
	start(){
		this._run = true;
	}

	/**
	 * stop description
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
		this._eventHandler.on(window, 'urlchanged', (e) => ::this.onUrlstate);

	}

	/**
	 * _bindInternalEvents description
	 * @return {Undefined}
	 */
	_bindInternalEvents(){

		this._eventHandler.on(window, 'popstate', (e) => ::this._forwardingOnIntervalEvents);
		this._eventHandler.on(document.body, 'click a', (e) => ::this._forwardingOnIntervalEvents);

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
	 * [_forwardingOnIntervalEvents description]
	 * @param  {Element} target
	 * @param  {String} type
	 * @return {Undefined}
	 */
	_forwardingOnIntervalEvents({target, type}){

		let urlObject = null;

		switch(type) {
		    case 'popstate':
		        urlObject = this._getUrlObject(document.location.href);
		        break;
		    case 'click':
				target.preveneDefault();
		        urlObject = this._getUrlObject(target.href);
				this._pushState(urlObject.fragment);
		        break;
		    default:
		        throw new Error('Something gone wrong! type does not exists');
		}

		// replace that with: this._eventhandler.trigger('urlchanged', {..})
		var event = new Event('urlchanged', { urlstate: urlObject });
		window.dispatchEvent(event);

	}

	/**
	 * _getUrlObject
	 * @param  {String} href
	 * @return {URL} url
	 */
	_getUrlObject(href){
		let url = new URL(href);
		url.fragment = url.href.replace(`${url.protocol}//${url.hostname}`, '');
		return url;
	}

	/**
	 * _matchRoute description
	 * @return {Boolean}
	 */
	_matchedRoute(){

	}

}
