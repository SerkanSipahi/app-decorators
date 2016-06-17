
import Eventhandler from '../libs/eventhandler';
import { Router } from '../libs/router';
import { Promise } from '../libs/dependencies';
import { XRegExp } from '../libs/dependencies';

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

		scope: Eventhandler.create({ element: config.scope || document && body || null }),

		event: {
			action: config.event_action || 'click a',
			urlchange: config.event_urlchange || 'urlchange',
		},
		mode: {
			stealth: config.mode_stealth || true,
		},
		helper: {
			createURL: config.createURL || window.URL,
			encodeURI: config.encodeURI || window.encodeURI,
			location: config.location || window.location,
			Promise: config.Promise || Promise,
			XRegExp: config.XRegExp || XRegExp,
		},
	};

	// assign and return Instance of Router + config
	let router = new Router(routerConfig);
	let popstateHandler = Eventhandler.create({ element: window });
	popstateHandler.on('popstate', router::router._onAction);

	return router;

}

export { Router };
