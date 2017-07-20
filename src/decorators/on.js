import { Eventhandler } from '../libs/eventhandler';
import { namespace } from '../helpers/namespace';
import { initCoreMap, initOnMap } from '../datas/init-maps';
import { storage } from '../libs/random-storage';

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

	return ({ constructor }, method, { value }) => {

		let Class = constructor;

		initCoreMap(storage, Class);
		initOnMap(storage, Class);

		let map = storage.get(Class);

		let handler = value;
		let eventsMap = map.get('@on').get('events');

		if(listenerElement === 'local'){
			eventsMap.get('local').push([
				eventDomain, handler
			]);
		} else {
			eventsMap.get('context').push([
				eventDomain, [ handler, listenerElement ]
			]);
		}

		/**
		 * ### Ensure "registerCallback('created', ..." (see below) registered only once ###
		 * This function will called every time if an event registered e.g. @on('click .foo')
		 * but registerOnCreatedCallback can only call once because we want only Create
		 * one Eventhandler
		 */
		if(map.get('@on').get('callbacksDefined')){
			return;
		}

		map.get('@callbacks').get('created').push(domNode => {

			// register local (domNode) events
			let eventsLocal = map.get('@on').get('events').get('local');
			if(eventsLocal.length){
				let eventHandler = on.helper.createLocalEventHandler(eventsLocal, domNode);
				namespace.create(domNode, '$eventHandler.local', eventHandler);
			}

			// register custom events
			let eventsContext = map.get('@on').get('events').get('context');
			if(eventsContext.length){
				on.helper.createCustomEventHandler(eventsContext, domNode, (eventHandler, name) => {
					namespace.create(domNode, `$eventHandler.${name}`, eventHandler);
				});
			}

		});

		map.get('@callbacks').get('attached').push(domNode => {

			let initialized = false;
			Object.values(domNode.$eventHandler).forEach(eventHandler => {
				if(eventHandler.initialized()){
					initialized = true;
				}
			});

			if(initialized){
				return;
			}

			Object.entries(domNode.$eventHandler).forEach(([name, eventHandler]) => {

				/**
				 * Using the same instance is 30% faster in
				 * (Chrome, Opera) and no difference in Firefox
				 * @see: https://jsperf.com/new-class-vs-singleton
				 */
				eventHandler.reinit({
					events:  map.get('@on').get('events').get(name),
					element: domNode,
					bind: domNode,
				});
			});

		});

		map.get('@callbacks').get('detached').push(domNode => {

			Object.values(domNode.$eventHandler).forEach(eventHandler => {
				eventHandler.destroy();
			});
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
	createLocalEventHandler(localScopeEvents, domNode){

		return new Eventhandler({
			events: localScopeEvents,
			element: domNode,
			bind: domNode,
		});
	},

	/**
	 * createCustomEventHandler
	 * @param  {object} eventsEntries
	 * @param  {HTMLElement} domNode
	 * @param  {function} callback
	 * @return {HTMLElement} domNode
	 */
	createCustomEventHandler(eventsEntries, domNode, callback = () => {}) {

		for(let eventEntry of eventsEntries){

			let [ event, [ handler, node ] ] = eventEntry;
			let eventHandler = new Eventhandler({ element: node, bind: domNode });
			let contextName = Object.prototype.toString.call(node).slice(8, -1).toLowerCase();
			let eventHandlerName = `${event}_${contextName}_${handler.name}`;

			eventHandler.on(event, handler);
			callback(eventHandler, eventHandlerName);
		}

		return domNode;
	},

};

export {
	on
};