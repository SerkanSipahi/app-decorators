
import { Object } from 'core-js/library';

export default class Eventhandler {

	/**
	 * Simple query selector
	 * @type {HTMLElement}
	 */
	$ = ::document.querySelector;

	/**
	 * Checks the type of given var
	 * @type {Function}
	 */
	classof = Object.classof;

	/**
	 * Passed config object
	 * @type {Object}
	 */
	config = {};

	constructor(config = {}) {

		/**
		 * Merge passed config
		 * ====================
		 *
		 * example config:
		 * {
		 *    events: {
		 *       "click": function onClick( e ) {}
		 *       "mouseup": function onMouseup( e ) {}
		 *    },
		 *    element: document.body,
		 *    bind: that // optional
		 * }
		 */
		Object.assign(this.config, config);
		// initialize EventHandler
		this._init();
	}

	/**
	 * Initialize Eventhandler
	 * @return {undefined}
	 */
	_init(){

		/**
		 * if no events passed return maybe the event will
		 * passed over "addEventCollection" or "addEvent"
		 */
		if(!this.config.events) {
			return;
		}

		/**
		 * if no element passed return maybe the element will
		 * passed over addElement
		 */
		if(!this.config.element){
			return;
		}

		this.addEventCollection(this.config.events);

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
	 * @return {Array} [ eventType, delegateSelector ]
	 */
	static prepareEventdomain(eventDomain) {

		if(Object.classof(eventDomain) !== 'String'){
			throw new Error('Passed argument must be a string');
		}

		let splitedEventDomain = eventDomain.split(' ');
		let eventType = splitedEventDomain[0];
		let delegateSelector = undefined;
		if(splitedEventDomain[1]){
			delegateSelector = splitedEventDomain.splice(1).join(' ');
		}

		return [ eventType, delegateSelector ];

	}

	/**
	 * Add collection of events
	 * Example: see above constructor config.events
	 * @param {Objbect} events
	 */
	addEventCollection(events){

		// merge passed arg into config.events
		Object.assign(this.config.events, events);

		// add events eventlistener
		for(let eventDomain in events){
			if(!events.hasOwnProperty(eventDomain)){
				continue;
			}
			this.addEvent(this.config.element, eventDomain, events[eventDomain]);
		}

	}

	/**
	 * Add single event
	 * @param {HTMLElement} element
	 * @param {String} eventDomain
	 * @param {Function} callback
	 */
	addEvent(element, eventDomain, callback) {

		let self = this;
		let [ eventType, delegateSelector ] = Eventhandler.prepareEventdomain(eventDomain);
		element.addEventListener(eventType, function( event ){
			if(!delegateSelector || this.matches(delegateSelector)) {
				self.bind ? callback.bind(self.bind)( event ) : callback( event );
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
