
export default class Eventhandler {

	constructor(config = {}) {
		this._init(config);
	}

	/**
	 * Passed config object
	 * @type {Object}
	 */
	config = {
		events: {},
		element: null,
		bind: null,
	};

	/**
	 * Main event callback wrapper
	 * @type {Object}
	 */
	mainEventCallackContainer = {};

	/**
	 * Initialize Eventhandler
	 * @return {undefined}
	 */
	_init(config){

		/**
		* Throw error if no element passed
		*/
		if(!config.element){
			throw new Error('Please pass an element. See documentation!');
		}
		// Assign element
		this.config.element = config.element;

		// bind bindObject
		if(config.bind){
			this.config.bind = config.bind;
			Eventhandler.bindObjectToEventList(config.events, config.bind);
		}
		// group events
		this.config.events = Eventhandler.groupEvents(config.events);

		// add events eventListener
		this._addEventCollection(this.config.events);

	}

	/**
	 * Create and return an instace of Eventhandler
	 * @param  {Object} ...args
	 * @return {Object}
	 */
	static create(...args){
		return new Eventhandler(...args);
	}

	/**
	 * Convert eventDomain into seperate item
	 * @param  {String} eventDomain
	 * @return {Array} [ type, delegateSelector ]
	 */
	static prepareEventdomain(eventDomain) {

		if(Object.classof(eventDomain) !== 'String'){
			throw new Error('Passed argument must be a string');
		}

		let splitedEventDomain = eventDomain.split(' ');
		let type = splitedEventDomain[0];
		let delegateSelector = null;
		if(splitedEventDomain[1]){
			delegateSelector = splitedEventDomain.splice(1).join(' ');
		}

		return [ type, delegateSelector ];

	}

	/**
	 * Group events
	 * @param  {Object} config
	 * @return {Object}
	 */
	static groupEvents(events = {}){

		let tmpConfig = {};

		for(let eventDomain in events){
			if(!events.hasOwnProperty(eventDomain)){
				continue;
			}

			let [ type, delegateSelector ] = Eventhandler.prepareEventdomain(eventDomain);
			if(!tmpConfig[type]){
				tmpConfig[type] = [];
			}

			tmpConfig[type].push({
				[ delegateSelector ]: events[eventDomain],
			});
		}

		return tmpConfig;

	}

	/**
	 * Bind object to event value
	 * @param  {Object} events
	 * @param  {Object} bindObject
	 * @return {undefined}
	 */
	static bindObjectToEventList(events = {}, bindObject){

		for(let eventDomain in events){
			if(!events.hasOwnProperty(eventDomain)){
				continue;
			}
			// bind and assign bindObject
			events[eventDomain] = bindObject::events[eventDomain];
		}

	}

	/**
	 * on
	 * @param  {String} eventDomain
	 * @param  {Function} handler
	 * @return {Undefined}
	 */
	on(eventDomain, handler){

		let [ type, delegateSelector ] = Eventhandler.prepareEventdomain(eventDomain);
		// if event type not registered, add to eventlistener
		if(!this.config.events[type]){
			this.config.events[type] = [];
			this._addEvent(this.config.element, type, this.config.events);
		}

		// add delegate selector to event list
		this.config.events[type].push({
			[ delegateSelector ]: this.config.bind ? this.config.bind::handler: handler,
		});

	}

	/**
	 * trigger
	 * @param  {String} event
	 * @param  {Any} value
	 * @return {Undefined}
	 */
	trigger(event, value = null){

		this.config.element.dispatchEvent(
			new Event(event, { detail: value })
		);

	}

	/**
	 * Return event callbacks
	 * @param  {String} eventType
	 * @return {Array|null}
	 */
	getHandlers(eventType){
		return this.config.events[eventType] || null;
	}

	/**
	 * Add collection of events
	 * Example: see above constructor config.events
	 * @param {Objbect} events
	 */
	_addEventCollection(events){

		// add events eventlistener
		for(let type in events){
			if(!events.hasOwnProperty(type)){
				continue;
			}
			this._addEvent(this.config.element, type, this.config.events);
		}

	}

	/**
	 * Add single event
	 * @param {HTMLElement} element
	 * @param {String} type
	 * @param {Function} callback
	 */
	_addEvent(element, type, configEvents) {

		this.mainEventCallackContainer[type] = ( event ) => {

			let delegateSelectors = configEvents[type];
			for(let delegateObject of delegateSelectors){

				// received key (delegateSelector) is always a key
				// therefore (see below) delegateSelector === "null"
				let delegateSelector = Object.keys(delegateObject)[0];
				let callback = delegateObject[delegateSelector];
				let matchedSelector = false;

				if(delegateSelector){
					matchedSelector = event.target.matches(delegateSelector);
				}

				if(delegateSelector === "null" || matchedSelector){
					callback(event);
				}

			}
		};

		element.addEventListener(type, this.mainEventCallackContainer[type], false);

	}

	/**
	 * Remove event from listener by given eventdomain
	 * @param  {String} eventDomain
	 * @return {undefined}
	 */
	removeEvent(eventDomain) {

		let [ type, delegateSelector ] = Eventhandler.prepareEventdomain(eventDomain);

		if(!this.config.events[type]) {
			throw new Error(`Event: ${type} not exists!`);
		}

		let index = 0;
		for(let delegateObject of this.config.events[type]){
			// remove delegate callback if passed e.g. "click .foo"
			if(delegateSelector && delegateObject[delegateSelector]){
				this.config.events[type].splice(index, 1);
			}
			// remove all callbacks if passed type e.g. "click" or e.g. "click" is empty
			if((type && delegateSelector === null) || this.config.events[type].length === 0){
				delete this.config.events[type];
			}
			index++;
		}

		// remove listener if eventsList empty or not exists
		if(!this.config.events[type]){
			this.config.element.removeEventListener(type, this.mainEventCallackContainer[type]);
			delete this.config.events[type];
		}

	}

	/**
	 * Removes all eventhandler
	 * @return {undefined}
	 */
	reset() {

		if(!Object.keys(this.config.events).length){
			return;
		}

		// add events eventlistener
		for(let type in this.config.events){
			if(!events.hasOwnProperty(type)){
				continue;
			}
			this.removeEvent(type);
		}

	}

}
