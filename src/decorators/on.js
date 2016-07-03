
// internal libs
import Eventhandler from '../libs/eventhandler';
import namespace from '../helpers/namespace';

/**
 * on (EventHandler)
 * @param  {Any} ...args
 * @return {Function}
 */
export default function on(eventDomain, listenerElement) {

	if(!eventDomain){
		throw new Error('Please pass an event type e.g "click"');
	}

	return (target, method, descriptor) => {

		// register namespaces
		on.helper.registerNamespaces(target);
		// register events
		on.helper.registerEvent(target, eventDomain, descriptor.value, listenerElement);

		/**
		 * ### Ensure "registerCallback('created', ..." (see below) registered only once ###
		 * This function will called every time if an event registered e.g. @on('click .foo')
		 * but registerOnCreatedCallback can only call once because we want only Create
		 * one eventhandler
		 */
		if(target.$onCreated.on.length > 0){
			return;
		}

		on.helper.registerCallback('created', target, ( domNode ) => {

			// register local (domNode) events
			let { local } = target.$appDecorators.on.events;
			let eventHandler = on.helper.createLocalEventHandler(local, domNode);
			domNode = namespace.create(domNode, '$.eventHandler.local', eventHandler);

			// register custom events
			let events = target.$appDecorators.on.events;
			domNode = on.helper.createCustomEventHandler(events, domNode, (eventHandler, scope, event) => {
				namespace.create(domNode, `$.eventHandler.${scope}_${event}`, eventHandler);
			});

		});

		on.helper.registerCallback('attached', target, (domNode) => {

		});

		on.helper.registerCallback('detached', target, (domNode) => {

			// cleanup: remove all eventhandler
			Object.keys(domNode.$.eventHandler).each((value) => {
				domNode.$.eventHandler[value].reset();
				domNode.$.eventHandler[value] = null;
			});

		});

	}
}

/*****************************************
 * ########## Decorator Helper ###########
 *****************************************/

on.helper = {

	/**
	 * Helper for registering events
	 * @param  {String} event
	 * @param  {Function} callback
	 * @return {Function} target
	 */
	registerEvent: (target, eventDomain, callback = function(){}, listenerElement = 'local') => {

		if(!target.$appDecorators.on.events[listenerElement]) {
			target.$appDecorators.on.events[listenerElement] = {};
		}

		// define events
		if(listenerElement === 'local'){
			target.$appDecorators.on.events[listenerElement][eventDomain] = callback;
		} else {
			target.$appDecorators.on.events[listenerElement][eventDomain] = [ callback, listenerElement ];
		}

		return target;
	},

	/**
	 * Helper for registering callbacks
	 * @param  {String} name
	 * @param  {Function} target
	 * @return {Function} callack
	 */
	registerCallback: (name, target, callback) => {

		// ucFirst
		name = name.charAt(0).toUpperCase()+name.slice(1);
		// its created something like onCreated if passed name=created
		target[`$on${name}`].on.push(callback);

		return target;
	},

	/**
	 * Register namespace of on decorator
	 * @param  {Function|Objet} target
	 * @return {Function} target
	 */
	registerNamespaces: (target) => {

		// define $appDecorators.on namespace
		if(!target.$appDecorators) target.$appDecorators = {};
		if(!target.$appDecorators.on) {
			target.$appDecorators.on = {
				events : { local: {} },
			};
		}

		// define $onCreated.on namespace
		if(!target.$onCreated) target.$onCreated = {};
		if(!target.$onCreated.on) target.$onCreated.on = [];

		// define $onDetached.on callbacks
		if(!target.$onDetached) target.$onDetached = {};
		if(!target.$onDetached.on) target.$onDetached.on = [];

		// define $onAttached.on callbacks
		if(!target.$onAttached) target.$onAttached = {};
		if(!target.$onAttached.on) target.$onAttached.on = [];

		return target;
	},

	/**
	 * createLocalEventHandler
	 * @param  {object} events
	 * @param  {Element} element
	 * @return {object} eventHandler
	 */
	createLocalEventHandler: (localScopeEvents, domNode) => {

		let eventHandler = Eventhandler.create({
			events: localScopeEvents,
			element: domNode,
			bind: domNode,
		});

		return eventHandler;
	},

	/**
	 * createCustomEventHandler
	 * @param  {object} events
	 * @param  {Element} element
	 * @return {undefined}
	 */
	createCustomEventHandler: (events, domNode, callback = () => {}) => {

		for(let scope of Object.keys(events)){

			if(scope === 'local') {
				continue;
			}

			for(let event of Object.keys(events[scope])) {

				let [ handler, node ] = events[scope][event];
				let eventHandlerConfig = {
					[ event ]: handler
				};

				let eventHandler = Eventhandler.create({
					events: eventHandlerConfig,
					element: node,
					bind: domNode,
				});

				callback(eventHandler, scope, event);

			}
		}

		return domNode;
	},

};
