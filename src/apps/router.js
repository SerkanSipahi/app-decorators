
import Eventhandler from '../libs/eventhandler';
import Router from '../libs/router';

/**
 * create
 * @param  {Object} config
 * @return {Router} router
 */
Router.create = function(config = {}){

	let $routerConfig = {
		config : {

			routes: config.routes,
			pushState: ::history.pushState,
			replaceState: ::history.replaceState,
			forward: ::history.forward,
			back: ::history.back,

			scope_root: Eventhandler.create({ element: config.scope_root || document && document.body || null }),
			event_root: config.event_root || 'click a',

			scope_popstate: Eventhandler.create({ element: config.scope_popstate || window}),
			event_popsate: config.event_popsate || 'popstate',

			scope_urlchange: Eventhandler.create({ element: config.scope_urlchange || window}),

			URLResolver: config.URLResolver || window.URL,
			encodeURI: config.encodeURI || window.encodeURI,
		},
	};

	// assign and return Instance of Router + config
	return new Router($routerConfig);

}

export default Router;
