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

		let mapClassOn = storage.get(Class);
		let handler = value;
		let eventsMap = mapClassOn.get('@on').get('events');

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
		 * This function will called every time if an event will be registered e.g. over @on('click .foo')
		 * but registerOnCreatedCallback can only call once because we want only Create
		 * one Eventhandler
		 */
		if(mapClassOn.get('@on').get('callbacksDefined')){
			return;
		}

		mapClassOn.get('@callbacks').get('created').push(domNode => {

			// register local (domNode) events e.g. thats depends on element click mousemove, etc
			let eventsLocal = mapClassOn.get('@on').get('events').get('local');
			if(eventsLocal.length){
				let eventHandler = on.helper.createLocalEventHandler(eventsLocal, domNode);
				namespace.create(domNode, '$eventHandler.local', eventHandler);
			}

			// register custom events e.g. thats depend on e.g. window onresize, onwheel, etc
			let eventsContext = mapClassOn.get('@on').get('events').get('context');
			if(eventsContext.length){
				on.helper.createCustomEventHandler(eventsContext, domNode, (eventHandler, name) => {
					namespace.create(domNode, `$eventHandler.${name}`, eventHandler);
				});
			}

		});

		mapClassOn.get('@callbacks').get('attached').push(domNode => {

			// this behavior ensures that when the domNode is
			// attached, detached, attached
			let eventHandlerLength = 0;
			let $eventHandler = Object.values(domNode.$eventHandler);
			$eventHandler.forEach(eventHandler => {
				if(eventHandler.initialized()){
                    eventHandlerLength++
				}
			});

			if(eventHandlerLength === $eventHandler.length){
				return;
			}

			Object.entries(domNode.$eventHandler).forEach(([name, eventHandler]) => {

				/**
				 * Using the same instance is 30% faster in
				 * (Chrome, Opera) and no difference in Firefox
				 * @see: https://jsperf.com/new-class-vs-singleton
				 */
				eventHandler.reinit({
					events:  mapClassOn.get('@on').get('events').get(name),
					element: domNode,
					bind: domNode,
				});
			});

		});

		mapClassOn.get('@callbacks').get('detached').push(domNode => {

			Object.values(domNode.$eventHandler).forEach(eventHandler => {
				eventHandler.destroy();
			});
		});

		mapClassOn.get('@on').set('callbacksDefined', true);

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