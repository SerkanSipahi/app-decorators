import { trigger } from '../helpers/trigger';
import { initCoreMap } from '../datas/init-maps';
import { storage } from 'app-decorators-helper/random-storage';

/**
 * customElementHooks
 * @type {string[]}
 */
let customElementHooks = [
	'created',
	'attached',
	'detached',
	'attributeChanged',
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
 * @param callbackName {string}
 * @param callbacks {function[]}
 * @param vars {object}
 */
function init(callbackName, callbacks = [() => {}], vars){

	callbacks.forEach(cb => cb(this, vars));

	this[callbackName]? this[callbackName](vars): null;
	this::trigger(callbackName, vars);
}

/**
 * component {function}
 * @param {object} settings
 */
function component(settings = {}) {

	/**
	 * decorator
	 * @param  {function} ComponentClass
	 */
	return function decorator(Class) {

		initCoreMap(storage, Class);

		let map = storage.get(Class);
		map.set('@component', settings);

		for(let callbackName of customElementHooks){
			Class.prototype[`${callbackName}Callback`] = function(vars){
				let callbacks = map.get('@callbacks').get(callbackName);
				this::init(callbackName, callbacks, vars);
			};
		}
	}
}

export {
	init,
	component,
	getComponentName,
};
