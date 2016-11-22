let Register = {

	/**
	 * Prefix of component if used
	 * e.g. com-foo
	 */
	prefix: 'com',

	/**
	 * customElement
	 * @param Class {function}
	 * @param config {{extends: string, name: string}}
	 */
	customElement(Class, config = {}){

		let name = config.name;
		if(!name){
			let className = this._getClassName(Class);
			name = this._createComponentName(className, this.prefix);
		} else {
			delete config.name;
		}

		this._addExtends(Class, config);
		this._registerElement(Class, name);
	},

	/**
	 * _addExtends
	 * @param Class {function}
	 * @param config {{extends: string, name: string}}
	 * @returns Class {function}
	 */
	_addExtends(Class, config = {}){

		let inherit = config.extends;
		if(inherit && !Class.extends){
			Class.extends = inherit;
		}

		return Class;
	},

	/**
	 *
	 * @param Class {function}
	 * @returns className {string}
	 */
	_getClassName(Class){

		return Class.prototype.constructor.name;
	},

	/**
	 *
	 * @param className {string}
	 * @param prefix {string}
	 * @returns componentName {string}
	 */
	_createComponentName(className, prefix = this.prefix){

		return `${prefix}-${className.toLowerCase()}`;
	},

	/**
	 * _enableConstructorVars
	 * @param Class {function}
	 * @private
	 */
	_enableConstructorVars(Class){

		let createdCallback = Class.prototype.createdCallback;
		Class.prototype.createdCallback = function(vars){

			if(!vars && !this.parentElement){
				return;
			}
			this::createdCallback(vars);
		};

		return Class;
	},

	/**
	 * registerElement
	 * @param Class {function}
	 * @param name {string}
	 * @returns Class {function}
	 */
	_registerElement(Class, name){

		this._enableConstructorVars(Class);

		// register element
		let registeredElement = document.registerElement(name, Class);

		/**
		 * create (add factory)
		 * @param vars {object}
		 */
		Class.create = function(vars) {

			if(arguments.length > 1){
				throw new Error('Its not allowd to pass more than one argument');
			}

			let classof = Object.classof(vars);
			if(!(classof === 'Object' || classof === 'Undefined')) {
				throw new Error('Passed argument must be an object or undefined');
			}

			let element = new registeredElement();

			element.createdCallback(
				// do immutable
				JSON.parse(JSON.stringify(vars || ""))
			);
			return element;
		};

		return Class;
	}
};


/**
 * !!!!! DEPRECATED !!!!!!!
 * New implementation see above: Register object
 */
class CustomElement {

	/**
	 * Default prefix
	 * @type {String}
	 */
	static defaultPrefix = 'com';

	/**
	 * Register an element by give ES5/ES6 Class
	 * @param  {function} ComponentClass
	 * @param  {object} config
	 * @return {undefined}
	 */
	static register(ComponentClass, config = {}, registerConfig) {

		let componentName = config.name || null;

		// create componentname if config.name is not passed
		if(componentName === null) {
			let componentClassName = CustomElement.getClassName(ComponentClass);
			componentName = CustomElement.convertToValidComponentName(componentClassName, CustomElement.defaultPrefix);
		}

		ComponentClass = CustomElement.addCustomElementsCallbacks(ComponentClass);

		// register element
		let ComElement = document.registerElement(componentName, ComponentClass);

		// create static factory method for creating dominstance
		ComponentClass.create = function(create_vars){

			if(arguments.length > 1){
				throw new Error('Its not allowd to pass more than one argument');
			}

			let classof = Object.classof(create_vars);
			if(!(classof === 'Object' || classof === 'Undefined')) {
				throw new Error('Passed Object must be an object or undefined');
			}

			// make sure passed object is immutable (no reference)
			if(classof === 'Object'){
				create_vars = JSON.parse(JSON.stringify(create_vars));
			}

			// create an instance of customElement
			let comElement = new ComElement();
			comElement.createdCallback(create_vars);

			return comElement;
		};
	}

	/**
	 * Convert given String (name) in valid webcomponent name
	 * @param  {string} name
	 * @param  {string} prefix
	 * @return {string}
	 */
	static convertToValidComponentName(name, prefix = 'com') {
		return `${prefix}-${name.toLowerCase()}`;
	}

	/**
	 * Apply onCratedCallbacks
	 * @param  {object} self
	 * @param  {array} created
	 * @return {arguments} ...args
	 */
	static applyOnCreatedCallback(self, created = [], ...args){

		created.forEach(callback => callback(self, ...args));
	}

	/**
	 * Returns custom element callbacks
	 * @param  {class} ComponentClass
	 * @return {Object}
	 */
	static addCustomElementsCallbacks(ComponentClass){

		ComponentClass.prototype.createdCallback = function(...args) {

			/**
			 * INFO: die Auswirkungen kommen direct aus der .create()
			 * Methode siehe zeile 76. Weil create new aufruft hat es kein Parent. Daher
			 * wissen wir das es mit new aufgerufen wurde.
			 *
			 * Wenn es ein parent element hat, dann kommt es aus dem Dom.
			 *
			 * Created sollte die dom attribute auslesen z.b height und width vom image und
			 * diese dem constructor (created) übergeben
			 *
			 * WICHTIG: die condition hier raus ! diese sollte in creaed passieren. Und auch
			 * Object.keys(this.$.config).forEach(type => { .... applyOnCreatedCallback
			 *
			 * 1.) If no args and no parentElement then was called .create(). We can only
			 * skip the if-block if "createdCallback" was called through create manually.
			 *
			 * 2.) If no args and has parentElement it was created automatically from browser.
			 * This accours when the customelement-tag is placed in dom
			 */

			if(!args.length && !this.parentElement){
				return;
			}

			// @TODO: refactor (see github: src/libs/customelement.js #20)
			if(this.$ && this.$.config) {
				Object.keys(this.$.config).forEach(type => {
					let callbacks = this.$.config[type].component.created;
					CustomElement.applyOnCreatedCallback(this, callbacks, ...args);
				});
			}
			this.created ? this.created(...args) : null;

			CustomElement.trigger(this, 'created');

		};
		ComponentClass.prototype.attachedCallback = function(...args) {

			// @TODO: refactor (see github: src/libs/customelement.js #20)
			if(this.$ && this.$.config) {
				Object.keys(this.$.config).forEach(type => {
					let callbacks = this.$.config[type].component.attached;
					CustomElement.applyOnCreatedCallback(this, callbacks, ...args);
				});
			}
			this.attached ? this.attached() : null;
			CustomElement.trigger(this, 'attached');

		};
		ComponentClass.prototype.detachedCallback = function(...args) {

			// @TODO: refactor (see github: src/libs/customelement.js #20)
			if(this.$ && this.$.config) {
				Object.keys(this.$.config).forEach(type => {
					let callbacks = this.$.config[type].component.detached;
					CustomElement.applyOnCreatedCallback(this, callbacks, ...args);
				});
			}
			this.detached ? this.detached() : null;
			CustomElement.trigger(this, 'detached');
		};
		ComponentClass.prototype.attributeChangedCallback = function(...args) {

			this.attributeChanged ? this.attributeChanged(...args) : null;
			CustomElement.trigger(this, 'attributeChanged', ...args);
		};

		return ComponentClass;
	}

	/**
	 * trigger
	 * @param  {HTMLElement} element
	 * @param  {string} eventType
	 * @return {undefined}
	 */
	static trigger(element, eventType, ...args) {

		let event = new Event(event);
		args.length ? event[eventType] = args : null;
		element.dispatchEvent(event);
	}

	/**
	 * Return prototype by given Function-Class
	 * @param  {function} ClassComponent
	 * @return {object}
	 */

	static getPrototype(ClassComponent){

		return ClassComponent.prototype || ClassComponent.__proto__ || null;
	}

	/**
	 * Return classname by given Function-Class
	 * @param  {function} ClassComponent
	 * @return {string}
	 */
	static getClassName(ClassComponent) {

		let prototype = CustomElement.getPrototype(ClassComponent);
		return ( prototype !== null ? prototype.constructor.name : null );
	}
}

export {
	CustomElement,
	Register,
};
