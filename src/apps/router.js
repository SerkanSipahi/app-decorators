import { Eventhandler} from '../libs/eventhandler';
import { Router } from '../libs/router';
import { RegExp } from '../libs/dependencies';
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

		history: new Eventhandler({
			element: config.window || window || null,
		}),
		scope: new Eventhandler({
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
			RegExp: config.RegExp || RegExp,
			queryString: config.queryString || queryString,
			guid: config.guid || guid,
		},
	};

	return Reflect.construct(Router, [routerConfig]);

};

export {
	Router
};
