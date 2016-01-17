
import { Object } from 'core-js/library';

export default class Eventhandler {

	/**
	 * Checks the type of given var
	 * @type {Function}
	 */
	classof = Object.classof;

	/**
	 * Passed config object
	 * @type {Object}
	 */
	config = {
		events : {},
		element : null,
		bind: null,
	};

	constructor(config = {}) {

		// initialize EventHandler
		this._init(config);
	}

	/**
	 * Initialize Eventhandler
	 * @return {undefined}
	 */
	_init(config){

		/**
		 * Throw error if no events passed
		 */
		if(!config.events) {
			throw new Error('Please pass events. See documentation!');
		}

		/**
		 * Throw error if no element passed
		 */
		if(!config.element){
			throw new Error('Please pass an element. See documentation!');
		}

		// bind bindObject
		Eventhandler.bindObjectToEventList(config.events, config.bind);
		// group events
		let groupedEvents = Eventhandler.groupEvents(config.events);
		// Merge passed config
		Object.assign(this.config.events, groupedEvents);
		// Assign element
		this.config.element = config.element;

		// add events eventListener
		this._addEventCollection(groupedEvents);

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
	 * Return event callbacks
	 * @param  {String} eventType
	 * @return {Array}
	 */
	_get(eventType){
		return this.config.events[eventType];
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
			this._addEvent(this.config.element, type, events[type]);
		}

	}

	/**
	 * Add single event
	 * @param {HTMLElement} element
	 * @param {String} eventDomain
	 * @param {Function} callback
	 */
	_addEvent(element, type, delegateSelectors) {

		element.addEventListener(type, ( event ) => {

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
		});

	}

	/**
	 * Remove all events from eventshandler
	 * @return {undefined}
	 */
	removeEvents() {

		for(let eventDomain in this.config.events){
			if(!events.hasOwnProperty(eventDomain)){
				continue;
			}
			this.removeEvent(eventDomain);
		}

	}

	/**
	 * Remove event from listener by given eventdomain
	 * @param  {String} eventDomain
	 * @return {undefined}
	 */
	removeEvent(eventDomain) {

		// get needed values for removing
		let [ eventType, ] = Eventhandler.prepareEventdomain(eventDomain);
		let callback = this.config.events[eventDomain];
		// remove event from listener
		this.config.element.removeEventListener(eventType, callback);

	}

}
