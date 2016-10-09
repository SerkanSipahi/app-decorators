
import { Eventhandler} from '../libs/eventhandler';
import { Router } from '../libs/router';
import { Promise } from '../libs/dependencies';
import { XRegExp } from '../libs/dependencies';
import { queryString } from '../helpers/queryString';
import { guid } from '../helpers/guid';

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

		routes: config.routes || null,
		bind: config.bind || null,

		pushState: ::history.pushState,
		replaceState: ::history.replaceState,
		forward: ::history.forward,
		back: ::history.back,

		tmpDomain: 'http://x.x',

		history: Eventhandler.create({
			element: config.window || window || null,
		}),
		scope: Eventhandler.create({
			element: config.scope || document && body || null,
		}),

		event: {
			action: config.event_action || 'click a',
			popstate: config.event_pushstate || 'popstate',
			urlchange: config.event_urlchange || 'urlchange',
		},
		mode: {
			shadowRoute: config.shadowRoute || false,
		},
		helper: {
			createURL: config.createURL || window.URL,
			encodeURI: config.encodeURI || window.encodeURI,
			location: config.location || window.location,
			Promise: config.Promise || Promise,
			XRegExp: config.XRegExp || XRegExp,
			queryString: config.queryString || queryString,
			guid: config.guid || guid,
		},
	};

	let router = new Router(routerConfig);
	return router;

};

export {
	Router
};
