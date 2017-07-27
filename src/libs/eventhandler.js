
class Eventhandler {

	constructor(config = {}) {
		this.init(config);
	}

	/**
	 * _rootNode
	 * @type {WeakMap}
	 */
	_refs = {
		events: {},
		element: null,
		bind: null,
	};

	/**
	 * _element
	 */
	set _events(events) {
		this._refs.get(this).set('events', events);
	};
	get _events() {
		let _result = this._refs.get(this);
		return _result && this._refs.get(this).get('events') || {};
	};

	/**
	 * _element
	 */
	set _element(element) {
		this._refs.get(this).set('element', element);
	};
	get _element() {
		let _result = this._refs.get(this);
		return _result && this._refs.get(this).get('element') || {};
	};

	/**
	 * _bind
	 */
	set _bind(bind) {
		this._refs.get(this).set('bind', bind);
	};
	get _bind() {
		return this._refs.get(this).get('bind');
	};

	/**
	 * Main event callback wrapper
	 * @type {Object}
	 */
	_mainEventCallackContainer = {};

	/**
	 * init
	 * Initialize Eventhandler
	 * @return {undefined}
	 */
	init({ element, events, bind } = {}){

		this._initRefs({ element });

		// Assign element
		this._element = element;

		// bind bindObject
		if(bind){
			this._bind = bind;
			if(!events){
				return;
			}
			events = this._bindObjectToEventList(events, bind);
		}

		// group events
		let groupedEvents = this._groupEvents(events);
		this._events = groupedEvents;

		// add events eventListener
		this._addEventCollection(groupedEvents);

	}

	/**
	 * initialized
	 * @returns {boolean}
	 */
	initialized(){
		return this._refs.has(this);
	}

	/**
	 * reinit (alias for init)
	 * @param options {object}
	 */
	reinit(options){
		this.init(options);
	}

	/**
	 * destroy
	 * it will delete references
	 */
	destroy(){
		this._reset();
		this._refs.delete(this);
	}

	/**
	 * _initRefs
	 * @param element {HTMLElement}
	 * @private
	 */
	_initRefs({ element }){

		// init refs
		if(!element){
			throw new Error(`
				Required: element.
				Optional: use "events" when registering over constructor.
				Optional: use "bind" when bind object to handler.
			`);
		}

		if(!element instanceof HTMLElement) {
			throw new Error('Passed element should be instance of HTMLElement');
		}

		this._refs = new WeakMap([
			[this, new Map([
				['events', {}],
				['element', null],
				['bind',  null],
			])],
		]);
	}

	/**
	 * Convert eventDomain into seperate item
	 * @param  {String} eventDomain
	 * @return {Array} [ type, delegateSelector ]
	 */
	_prepareEventdomain(eventDomain) {

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
	_groupEvents(events = []){

		let tmpConfig = {};

		for(let [ eventDomain, handler ] of events){

			let [ type, delegateSelector ] = this._prepareEventdomain(eventDomain);
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
	_bindObjectToEventList(events = [], bindObject = {}){

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

		let events = this._events;
		let [ type, delegateSelector ] = this._prepareEventdomain(eventDomain);

		// if event type not registered, add to eventlistener
		if(!events[type]){
			events[type] = [];
			this._addEvent(this._element, type, events);
		}

		// add delegate selector to event list
		events[type].push({
			[ delegateSelector ]: this._bind ? this._bind::handler: handler,
		});

	}

	/**
	 * off event from listener by given eventdomain
	 * @param  {String} eventDomain
	 * @return {undefined}
	 */
	off(eventDomain) {

		let events = this._events;
		let [ type, delegateSelector ] = this._prepareEventdomain(eventDomain);

		if(!events[type]) {
			return;
		}

		let index = 0;
		for(let delegateObject of events[type]){
			// remove delegate callback if passed e.g. "click .foo"
			if(delegateSelector && delegateObject[delegateSelector]){
				events[type].splice(index, 1);
			}
			// remove all callbacks if passed type e.g. "click" or e.g. "click" is empty
			if((type && delegateSelector === null) || events[type].length === 0){
				delete events[type];
			}
			index++;
		}

		// remove listener if eventsList empty or not exists
		if(!events[type]){
			this._element.removeEventListener(type, this._mainEventCallackContainer[type]);
			delete events[type];
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
		this._element.dispatchEvent(event);

	}

	/**
	 * Return event callbacks
	 * @param  {String} eventType
	 * @return {Array|null}
	 */
	getHandlers(eventType){
		return this._events[eventType] || null;
	}

	/**
	 * Add collection of events
	 * Example: see above constructor _events
	 * @param {Objbect} events
	 */
	_addEventCollection(events){

		// add events eventlistener
		for(let type in events){
			if(!events.hasOwnProperty(type)){
				continue;
			}
			this._addEvent(this._element, type, this._events);
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
	_reset() {

		let events = this._events;

		if(!Object.keys(events).length){
			return;
		}

		// add events eventlistener
		for(let type in events){
			if(!events.hasOwnProperty(type)){
				continue;
			}
			this.off(type);
		}

	}

}

export {
	Eventhandler
}
