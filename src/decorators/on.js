import { Eventhandler } from '../libs/eventhandler';
import { namespace } from '../helpers/namespace';
import { storage } from 'app-decorators-helper/random-storage';

/**
 * on (EventHandler)
 * @param  {string} eventDomain
 * @params {string} listenerElement
 * @return {Function}
 */
function on(eventDomain, listenerElement) {

	if(!eventDomain){
		throw new Error('Please pass an event type e.g "click"');
	}

	return (target, method, descriptor) => {

		let Class = target.constructor;
		if(!storage.has(Class)){
			storage.set(Class, new Map());
		}

		let map = storage.get(Class);
		map.set('@on', {
			events: {
				local: {}
			},
		});

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
		if(target.$.config.on.component.created.length > 0){
			return;
		}

		on.helper.registerCallback('created', target, ( domNode ) => {

			// register local (domNode) events
			let local = target.$.config.on.events.local;
			let eventHandler = on.helper.createLocalEventHandler(local, domNode);
			namespace.create(domNode, '$eventHandler.local', eventHandler);

			// register custom events
			let events = target.$.config.on.events;
			on.helper.createCustomEventHandler(events, domNode, (eventHandler, scope, event) => {
				namespace.create(domNode, `$eventHandler.${scope}_${event}`, eventHandler);
			});

		});

		on.helper.registerCallback('attached', target, (domNode) => {

		});

		on.helper.registerCallback('detached', target, (domNode) => {

			// cleanup: remove all eventhandler
			Object.values(domNode.$eventHandler).forEach(eventHandler => {
				eventHandler.reset();
			});

		});

	}
}

/*****************************************
 * ########## Decorator Helper ###########
 *****************************************/

on.helper = {

	/**
	 * Register namespace of on decorator
	 * @param  {object} target
	 * @return {object} target
	 */
	registerNamespaces: (target) => {

		// register "root" namespace
		if(!target.$) target.$ = {};

		// register "config" namespace
		if(!target.$.config) target.$.config = {};

		// register "on" namespace
		if(!target.$.config.on) {
			target.$.config.on = {
				events: {
					local: {}
				},
				component: {
					created: [],
					attached: [],
					detached: [],
				},
			};
		}

		return target;
	},

	/**
	 * Helper for registering events
	 * @param  {string} event
	 * @param  {string} eventDomain
	 * @param  {Function} callback
	 * @param  {string} listenerElement
	 * @return {object} target
	 */
	registerEvent: (target, eventDomain, callback = function(){}, listenerElement = 'local') => {

		if(!target.$.config.on.events[listenerElement]) {
			target.$.config.on.events[listenerElement] = {};
		}

		// define events
		if(listenerElement === 'local'){
			target.$.config.on.events[listenerElement][eventDomain] = callback;
		} else {
			target.$.config.on.events[listenerElement][eventDomain] = [ callback, listenerElement ];
		}

		return target;
	},

	/**
	 * Helper for registering callbacks
	 * @param  {string} name
	 * @param  {object} target
	 * @return {function} callack
	 */
	registerCallback: (name, target, callback) => {

		target.$.config.on.component[name].push(callback);

		return target;
	},

	/**
	 * createLocalEventHandler
	 * @param  {object} localScopeEvents
	 * @param  {HTMLElement} domNode
	 * @return {Eventhandler} eventHandler
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
	 * @param  {HTMLElement} element
	 * @param  {function} callback
	 * @return {HTMLElement} domNode
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

export {
	on
};