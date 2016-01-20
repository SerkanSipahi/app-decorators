
// internal libs
import Eventhandler from '../libs/eventhandler';

/**
 * on (EventHandler)
 * @param  {Any} ...args
 * @return {Function}
 */
export default function on(eventDomain) {

	if(!eventDomain){
		throw new Error('Please pass an event type e.g "click"');
	}

	return (target, method, descriptor) => {

		// register events
		on.helper.registerEvent(target, eventDomain, method, descriptor.value);

		// define $onCreated callbacks
		if(!target.$onCreated) {
			target.$onCreated = [];
		}

		// ensure "registerOnCreatedCallback" called once
		if(target.$onCreated.length > 0){
			return;
		}

		on.helper.registerOnCreatedCallback(target, ( domNode ) => {

			let eventHandler = Eventhandler.create({
				events: domNode.$appDecorators.on.events,
				element: domNode,
			});

			// define namespace for eventhandler
			domNode.$ ? null : domNode.$ = {};
			domNode.$.eventHandler = eventHandler;

		});

		on.helper.registerOnDetachedCallback(target, (domNode) => {

			// cleanup: remove all eventhandler
			domNode.$.eventHandler.reset();
			domNode.$.eventHandler = null;

		});

	}
}

/*****************************************
 * ########## Decorator Helper ###########
 *****************************************/

// define namespace
on.helper = {};

/**
 * Helper for registering events
 * @param  {String} event
 * @param  {Function} callback
 * @return {Function} target
 */
on.helper.registerEvent = (target, eventDomain, method, callback = function(){}) => {

	// define namespaces
	on.helper.registerNamespaces(target);

	if(target.$appDecorators.on.events[eventDomain]) {
		throw new Error(`The method: "${method}" already exists!`);
	}

	// define events
	target.$appDecorators.on.events[eventDomain] = callback;

	return target;

};

/**
 * Register on created callback
 * @param  {Object} target
 * @param  {Function} callback
 * @return {Function} target
 */
on.helper.registerOnCreatedCallback = (target, callback) => {

	// init render engine
	target.$onCreated.push(callback);

	return target;

};

/**
 * Register on Detached callback
 * @param  {Object} target
 * @param  {Function} callback
 * @return {Function} target
 */
on.helper.registerOnDetachedCallback = (target, callback) => {

	// define $onCreated callbacks
	if(!target.$onDetached) {
		target.$onDetached = [];
	}

	// init render engine
	target.$onDetached.push(callback);

	return target;

};

/**
 * Register namespace of on decorator
 * @param  {Function|Objet} target
 * @return {Function} target
 */
on.helper.registerNamespaces = (target) => {

	// if namespace already exists do nothing
	if(target.$appDecorators && target.$appDecorators.on){
		return target;
	}

	// define namespace
	if(!target.$appDecorators){
		target.$appDecorators = {};
	}
	if(!target.$appDecorators.on){
		target.$appDecorators.on = {
			events : {},
		};
	}

	return target;
};
