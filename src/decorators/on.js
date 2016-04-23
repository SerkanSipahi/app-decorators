
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

		// register namespaces
		on.helper.registerNamespaces(target);

		// register events
		on.helper.registerEvent(target, eventDomain, descriptor.value);

		/**
		 * ### Ensure "registerOnCreatedCallback" (see below) registered only once ###
		 * This function will called every time if an event registered e.g. @on('click .foo')
		 * but registerOnCreatedCallback can only call once because we want only Create
		 * one eventhandler
		 */
		if(target.$onCreated.on.length > 0){
			return;
		}

		on.helper.registerOnCreatedCallback(target, ( domNode ) => {

			let eventHandler = Eventhandler.create({
				events: domNode.$appDecorators.on.events,
				element: domNode,
				bind: domNode,
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
on.helper.registerEvent = (target, eventDomain, callback = function(){}) => {

	if(target.$appDecorators.on.events[eventDomain]) {
		throw new Error(`The Event: "${eventDomain}" already exists!`);
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

	target.$onCreated.on.push(callback);
	return target;

};

/**
 * Register on onAttached callback
 * @param  {Object} target
 * @param  {Function} callback
 * @return {Function} target
 */
on.helper.registerOnAttachedCallback = (target, callback) => {

	target.$onAttached.on.push(callback);
	return target;

};

/**
 * Register on Detached callback
 * @param  {Object} target
 * @param  {Function} callback
 * @return {Function} target
 */
on.helper.registerOnDetachedCallback = (target, callback) => {

	// init render engine
	target.$onDetached.on.push(callback);
	return target;

};

/**
 * Register namespace of on decorator
 * @param  {Function|Objet} target
 * @return {Function} target
 */
on.helper.registerNamespaces = (target) => {

	// define $appDecorators.on namespace
	if(!target.$appDecorators) target.$appDecorators = {};
	if(!target.$appDecorators.on) {
		target.$appDecorators.on = {
			events : {},
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

};
