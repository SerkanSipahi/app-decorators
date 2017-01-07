
class Eventhandler {

	constructor(config = {}) {
		this.init(config);
	}

	/**
	 * _rootNode
	 * @type {WeakMap}
	 */
	_refs = null;

	/**
	 * Passed _config object
	 * @type {Object}
	 */
	_config = {
		events: {},
		element: null,
		bind: null,
	};

	/**
	 * Main event callback wrapper
	 * @type {Object}
	 */
	_mainEventCallackContainer = {};

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
		this._config.element = config.element;

		// bind bindObject
		if(config.bind){
			this._config.bind = config.bind;
			if(!config.events){
				return;
			}
			config.events = this.bindObjectToEventList(config.events, config.bind);
		}
		// group events
		this._config.events = this.groupEvents(config.events);

		// add events eventListener
		this._addEventCollection(this._config.events);

	}

	/**
	 * Create and return an instace of Eventhandler
	 * @param  {Object} ...args
	 * @return {Object}
	 */
	}

	/**
	 * Convert eventDomain into seperate item
	 * @param  {String} eventDomain
	 * @return {Array} [ type, delegateSelector ]
	 */
	prepareEventdomain(eventDomain) {

		if(Object.prototype.toString.call(eventDomain).slice(8, -1) !== 'String'){
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
	 * @param  {array} events
	 * @return {Object}
	 */
	groupEvents(events = []){

		let tmpConfig = {};

		for(let [ eventDomain, handler ] of events){

			let [ type, delegateSelector ] = this.prepareEventdomain(eventDomain);
			if(!tmpConfig[type]){
				tmpConfig[type] = [];
			}

			tmpConfig[type].push({
				[ delegateSelector ]: handler,
			});
		}

		return tmpConfig; 

	}

	/**
	 * Bind object to event value
	 * @param  {array} events
	 * @param  {Object} bindObject
	 * @return {array}
	 */
	bindObjectToEventList(events = [], bindObject = {}){

		let contextBindContainer = [];

		for(let [eventDomain, handler] of events){
			contextBindContainer.push([
				eventDomain, bindObject::handler
			]);
		}

		return contextBindContainer;
	}

	/**
	 * on
	 * @param  {String} eventDomain
	 * @param  {Function} handler
	 * @return {Undefined}
	 */
	on(eventDomain, handler){

		let [ type, delegateSelector ] = this.prepareEventdomain(eventDomain);
		// if event type not registered, add to eventlistener
		if(!this._config.events[type]){
			this._config.events[type] = [];
			this._addEvent(this._config.element, type, this._config.events);
		}

		// add delegate selector to event list
		this._config.events[type].push({
			[ delegateSelector ]: this._config.bind ? this._config.bind::handler: handler,
		});

	}

	/**
	 * off event from listener by given eventdomain
	 * @param  {String} eventDomain
	 * @return {undefined}
	 */
	off(eventDomain) {

		let [ type, delegateSelector ] = this.prepareEventdomain(eventDomain);

		if(!this._config.events[type]) {
			return;
		}

		let index = 0;
		for(let delegateObject of this._config.events[type]){
			// remove delegate callback if passed e.g. "click .foo"
			if(delegateSelector && delegateObject[delegateSelector]){
				this._config.events[type].splice(index, 1);
			}
			// remove all callbacks if passed type e.g. "click" or e.g. "click" is empty
			if((type && delegateSelector === null) || this._config.events[type].length === 0){
				delete this._config.events[type];
			}
			index++;
		}

		// remove listener if eventsList empty or not exists
		if(!this._config.events[type]){
			this._config.element.removeEventListener(type, this._mainEventCallackContainer[type]);
			delete this._config.events[type];
		}

	}

	/**
	 * trigger
	 * @param  {String} eventName
	 * @param  {Any} value
	 * @return {Undefined}
	 */
	trigger(eventName, value = null){

		let event = new CustomEvent(eventName, {
			detail: value,
			bubbles: true,
		});
		this._config.element.dispatchEvent(event);

	}

	/**
	 * Return event callbacks
	 * @param  {String} eventType
	 * @return {Array|null}
	 */
	getHandlers(eventType){
		return this._config.events[eventType] || null;
	}

	/**
	 * Add collection of events
	 * Example: see above constructor _config.events
	 * @param {Objbect} events
	 */
	_addEventCollection(events){

		// add events eventlistener
		for(let type in events){
			if(!events.hasOwnProperty(type)){
				continue;
			}
			this._addEvent(this._config.element, type, this._config.events);
		}

	}

	/**
	 * Add single event
	 * @param {HTMLElement} element
	 * @param {String} type
	 * @param {Function} callback
	 */
	_addEvent(element, type, configEvents) {

		// save reference callback. Its important for if necessary to remove it
		this._mainEventCallackContainer[type] = (event ) => {

			let delegateSelectors = configEvents[type];
			for(let delegateObject of delegateSelectors){

				// received key (delegateSelector) is always a key
				// therefore (see below) delegateSelector === "null"
				let delegateSelector = Object.keys(delegateObject)[0];
				let callback = delegateObject[delegateSelector];
				let matchedSelector = false;

				if(delegateSelector && event.target.matches){
					matchedSelector = event.target.matches(delegateSelector);
				}

				if(delegateSelector === "null" || matchedSelector){
					callback(event);
				}

			}
		};

		element.addEventListener(type, this._mainEventCallackContainer[type], false);

	}

	/**
	 * Removes all eventhandler
	 * @return {undefined}
	 */
	reset() {

		if(!Object.keys(this._config.events).length){
			return;
		}

		// add events eventlistener
		for(let type in this._config.events){
			if(!this._config.events.hasOwnProperty(type)){
				continue;
			}
			this.off(type);
		}

	}

}

export {
	Eventhandler
}
