import { CustomElement } from '../libs/customelement';
import { trigger } from '../helpers/trigger';
import { storage } from 'app-decorators-helper/random-storage';

/**
 * callbacks
 * @type {string[]}
 */
let callbacks = [
	'created',
	'attached',
	'detached',
	'attributeChanged'
];

/**
 * getComponentName
 * @returns {string} name
 */
function getComponentName() {

	let localName = this.localName;
	let isValue = this.getAttribute('is');

	return localName + (isValue ? `[is="${isValue}"]` : '');
}

/**
 * init
 * @param callbacks {array}
 * @param callbackName {string}
 * @param args
 */
function init(callbackName, callbacks, ...args){

	callbacks.forEach(cb => cb(this, ...args));
	this[callbackName]? this[callbackName](...args): null;
}

/**
 * trigger
 * @param  {HTMLElement} this
 * @param  {string} eventType
 * @return {undefined}
 */
function trigger(eventType, ...args) {

	let event = new Event(event);
	args.length ? event[eventType] = args : null;
	this.dispatchEvent(event);
}

/**
 * component {function}
 * @param {object} settings
 */
function component(settings = {}, dev = false) {

	/**
	 * decorator
	 * @param  {function} ComponentClass
	 */
	return function decorator(Class) {

		if(!storage.has(Class)){
			storage.set(Class, new Map());
		}

		let model = storage.get(Class);
		model.set('@component', settings);

		// init created, attached, detached and attributeChanged callbacks
		for(let callbackName of callbacks){
			Class.prototype[`${callbackName}Callback`] = function(...args){

				if(callbackName === 'created' && !args.length && !this.parentElement){
					return;
				}

				let callbacks = model.get('callbacks')[callbackName];
				this::init(callbackName, callbacks, ...args);

				this::trigger(callbackName, ...args)
			};
		}

		// init getName method
		Class.prototype.getName = getComponentName;

		// @deprecated
		if(!dev){
			CustomElement.register(Class, settings);
		}
	}
}

export {
	init,
	component,
	getComponentName,
};
