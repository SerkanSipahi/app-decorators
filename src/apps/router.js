
import Eventhandler from '../libs/eventhandler';
import Router from '../libs/router';

/**
 * create
 * @param  {Object} config
 * @return {Router} router
 */
Router.create = function(config = {}){

	let { window } = System.global;
	let { document } = window;
	let { body } = document;

	let routerConfig = {

		routes: config.routes,
		pushState: ::history.pushState,
		replaceState: ::history.replaceState,
		forward: ::history.forward,
		back: ::history.back,

		listener: {
			action: Eventhandler.create({ element: config.event_action || document && body || null }),
			urlchange: Eventhandler.create({ element: config.event_urlchange || window }),
		},
		event: {
			action: config.event_host || 'click a',
			urlchange: config.event_urlchange || 'urlchange',
		},
		mode: {
			stealth: config.mode_stealth || true,
		},
		helper: {
			URLResolver: config.URLResolver || window.URL,
			encodeURI: config.encodeURI || window.encodeURI,
			location: config.location || window.location,
			Promise: config.Promise || window.Promise,
		},
	};

	// assign and return Instance of Router + config
	let router = new Router(routerConfig);
	let popstateHandler = Eventhandler.create({ element: window });
	popstateHandler.on('popstate', router::router._onAction);

	return router;

}

export default Router;
