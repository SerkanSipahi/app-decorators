
/**
 * on (EventHandler)
 * @param  {Any} ...args
 * @return {Function}
 */
export default function on(...args) {

	if(!args.length){
		throw new Error('Please pass an event type e.g "click"');
	}

	return (target, method, descriptor) => {

		// register events
		on.helper.registerEvent(target, ...args, method, descriptor.value);

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

	if(target.$appDecorators.on.events[method]) {
		throw new Error(`The method: "${method}" already exists!`);
	}

	// prepare event domain
	let [ event, delegateSelector ] = on.helper.prepareEventDomain(eventDomain);

	// define events
	target.$appDecorators.on.events[method] = [ event, delegateSelector, callback ];

	return target;

};

/**
 * Prepare eventDomain
 * @param  {String} eventDomain
 * @return {Array}
 */
on.helper.prepareEventDomain = (eventDomain) => {

	let splitedEventDomain = eventDomain.split(' ');
	let event = splitedEventDomain[0];
	let delegateSelector = undefined;
	if(splitedEventDomain[1]){
		delegateSelector = splitedEventDomain.splice(1).join(' ');
	}

	return [ event, delegateSelector ];

}

/**
 * Register on created callback
 * @param  {Object} target
 * @param  {Function} callback
 * @return {Function} target
 */
on.helper.registerOnCreatedCallback = (target, callback) => {

	// define $onCreated callbacks
	if(!target.$onCreated) {
		target.$onCreated = [];
	}

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
on.helper.registerOnDeatchedCallback = (target, callback) => {

	// define $onCreated callbacks
	if(!target.$onDetached) {
		target.$Detached = [];
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
	target.$appDecorators = {
		on: {
			events: {},
		},
	};

	return target;
};
