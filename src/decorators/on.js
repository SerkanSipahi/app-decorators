import { Eventhandler } from '../libs/eventhandler';
import { namespace } from '../helpers/namespace';
import { initCoreMap, initOnMap } from '../datas/init-maps';
import { storage } from 'app-decorators-helper/random-storage';

/**
 * on (EventHandler)
 * @param  {string} eventDomain
 * @params {string} listenerElement
 * @return {Function}
 */
function on(eventDomain, listenerElement = 'local') {

	if(!eventDomain){
		throw new Error('Please pass an event type e.g "click"');
	}

	return (target, method, descriptor) => {

		let Class = target.constructor;
		initCoreMap(storage, Class);
		initOnMap(storage, Class);

		let map = storage.get(Class);

		let handler = descriptor.value;
		let eventsMap = map.get('@on').get('events');
		if(listenerElement === 'local'){
			eventsMap.get('local').set(eventDomain, handler);
		} else {
			eventsMap.get('context').set(eventDomain, [ handler, listenerElement ]);
		}


		/**
		 * ### Ensure "registerCallback('created', ..." (see below) registered only once ###
		 * This function will called every time if an event registered e.g. @on('click .foo')
		 * but registerOnCreatedCallback can only call once because we want only Create
		 * one eventhandler
		 */
		if(map.get('@on').get('callbacksDefined')){
			return;
		}

		map.get('@callbacks').get('created').push(domNode => {

			let eventsLocal = {};
			let entriesLocal = map.get('@on').get('events').get('local').entries();
			Array.from(entriesLocal).forEach(item => eventsLocal[item[0]] = item[1]);

			// register local (domNode) events
			let eventHandler = on.helper.createLocalEventHandler(eventsLocal, domNode);
			namespace.create(domNode, '$eventHandler.local', eventHandler);

			// register custom events
			let entriesContext = map.get('@on').get('events').get('context').entries();
			on.helper.createCustomEventHandler(entriesContext, domNode, (eventHandler, context, event) => {
				namespace.create(domNode, `$eventHandler.${context}_${event}`, eventHandler);
			});

		});

		map.get('@callbacks').get('attached').push(domNode => {

		});

		map.get('@callbacks').get('detached').push(domNode => {

			// cleanup: remove all eventhandler
			Object.values(domNode.$eventHandler).forEach(eventHandler => {
				eventHandler.reset();
			});

			// reset reference
			//target.$eventHandler = null;
		});

		map.get('@on').set('callbacksDefined', true);

	}
}

/*****************************************
 * ########## Decorator Helper ###########
 *****************************************/

on.helper = {

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
	 * @param  {object} eventsEntries
	 * @param  {HTMLElement} domNode
	 * @param  {function} callback
	 * @return {HTMLElement} domNode
	 */
	createCustomEventHandler: (eventsEntries, domNode, callback = () => {}) => {

		for(let eventEntry of eventsEntries){

				let [ event, [ handler, node ] ] = eventEntry;
				let eventHandlerConfig = {
					[ event ]: handler
				};

				let eventHandler = Eventhandler.create({
					events: eventHandlerConfig,
					element: node,
					bind: domNode,
				});

				let context = Object.prototype.toString.call(node);
				callback(eventHandler, context, event);
		}

		return domNode;
	},

};

export {
	on
};