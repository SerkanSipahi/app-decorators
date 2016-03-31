
export default class CustomElement {

	/**
	 * Default prefix
	 * @type {String}
	 */
	static defaultPrefix = 'com';

	/**
	 * Register an element by give ES5/ES6 Class
	 * @param  {Function} ComponentClass
	 * @param  {Element} DOMElement
	 * @return {undefined}
	 */
	static register(ComponentClass, config = {}) {

		let componentName = config.name || null;
		let componentExtends = config.extends || null;
		let { Elements, Immutable } = config;

		// assign to DOMElement right Element by passed "extends" property
		// e.g. if passed is img its return HTMLImageElement or on form HTMLFormElement
		let DOMElement = HTMLElement;
		if(componentExtends !== null) {
			DOMElement = Elements[componentExtends];
			if(!DOMElement){
				throw new Error(`"${componentExtends}" is not valid selector name or not exists in src/datas/elements.js`);
			}
		}

		/**
		 * Safari´s Nativ Element Class it not a function.
		 * We have to map them to a function otherwise it throw an error.
		 */
		if (typeof DOMElement !== 'function'){
		    var _Element = function(){};
		    _Element.prototype = DOMElement.prototype;
		    DOMElement = _Element;
		}

		// create componentname if config.name is not passed
		if(componentName === null) {
			let componentClassName = CustomElement.getClassName(ComponentClass);
			componentName = CustomElement.convertToValidComponentName(componentClassName, CustomElement.defaultPrefix);
		}

		// buildComponent
		DOMElement = CustomElement.buildComponent(ComponentClass, DOMElement);

		// register element
		let customCallbacks = CustomElement.getCustomCallbacks();
		let registerElementOptions = {
			prototype: Object.create(DOMElement.prototype, customCallbacks),
		};
		if(componentExtends !== null) {
			Object.assign(registerElementOptions, { extends: componentExtends});
		}
		let ComElement = document.registerElement(componentName, registerElementOptions);

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
				create_vars = Immutable.Map(create_vars).toJS();
			}

			// create an instance of customElement
			let comElement = new ComElement();

			// extract and assign class properties
			let tmpInstanceProperties = new ComponentClass();
			let instanceProperties = {};
			for(let property of Object.getOwnPropertyNames(tmpInstanceProperties)){
				instanceProperties[property] = tmpInstanceProperties[property];
			}
			Object.assign(comElement, instanceProperties);

			// cleanup
			tmpInstanceProperties = null;
			instanceProperties = null;

			comElement.createdCallback(create_vars);

			return comElement;
		};
	}

	static buildComponent(ComponentClass, DOMElement){

		let CollectionOfClasses = CustomElement.explodeByExtends(ComponentClass);
		let ConstructedClass = CustomElement.constructDOMClass(CollectionOfClasses, DOMElement);

		return ConstructedClass;
	}

	/**
	 * Convert given String (name) in valid webcomponent name
	 * @param  {String} name
	 * @param  {String} prefix
	 * @return {String}
	 */
	static convertToValidComponentName(name, prefix = 'com') {
		return `${prefix}-${name.toLowerCase()}`;
	}

	/**
	 * Explode given Class by extends
	 * @param  {Function} ComponentClass
	 * @return {Array}
	 */
	static explodeByExtends(ComponentClass) {

		let constructor = true;
		let resolvedClass = ComponentClass;
		let explodedExtends = [];
		while(constructor){
			// resolve given class "ComponentClass" recursivly
			// see tests for better understanding
			resolvedClass = CustomElement.resolveClassInComponents(
				!(1 in resolvedClass) ? resolvedClass : resolvedClass[1]
			);
			constructor = resolvedClass[0];
			if(!constructor) {
				continue;
			}
			explodedExtends.push(resolvedClass);
		}
		return explodedExtends;

	}

	/**
	 * Resolve given Class in useable components
	 * @param  {Function} ClassComponent
	 * @return {Array}
	 */
	static resolveClassInComponents(ClassComponent = {}){

		// methods collection designed for createClass
		let instanceMethods = [];
		let staticMethods = [];

		// resolve Class in useful components
		let prototype = CustomElement.getPrototype(ClassComponent);
		let className = CustomElement.getClassName(ClassComponent);
		let constructor = CustomElement.getConstructor(ClassComponent);

		// if reached className is "Object" set "see inside block" to null
		if(className === 'Object'){
			prototype = className = constructor = null;
		}

		// preparing instance and static methods for createClass
		if(constructor && prototype && className !== 'Object'){
			instanceMethods = CustomElement.getInstanceMethods(ClassComponent);
			staticMethods = CustomElement.getStaticMethods(ClassComponent);
		}

		return [ constructor, prototype, instanceMethods, staticMethods ];
	}

	/**
	 * Construct given Class-Collection with an DOMElement
	 *
	 * @param  {Array} collection
	 * @param  {Element} DOMElement
	 * @return {Function}
	 */
	static constructDOMClass(collection = [], DOMElement) {

		// default behavoir of function: if class without any parent class
		let ConstructedClass = null;
		let [ Constructor,, instanceMethods, staticMethods] = collection.pop();

		if(Constructor && DOMElement){
			CustomElement.inherits(Constructor, DOMElement);
			CustomElement.createClass(Constructor, instanceMethods, staticMethods);
		}

		if(!collection.length) {
			return Constructor;
		}

		// extended behavoir of function: if class has any parent classes
		while(collection.length) {
			let [ FirstConstructor,, instanceMethods,staticMethods] = collection.pop();
			Constructor = CustomElement.inherits(FirstConstructor, Constructor);
			CustomElement.createClass(Constructor, instanceMethods, staticMethods);
		}

		return Constructor;
	}

	/**
	 * Extract and build methods in new object structure for createClass
	 * @param  {Object} propObject
	 * @param  {Object} options
	 * @return {Array} methodContainer
	 */
	static extractProperties(propObject, options){

		let methodContainer = [];
		for(let method of Reflect.ownKeys(propObject)) {
			let ignore = options.ignore;
			if(ignore && method.match(ignore)) {
				continue;
			};
			methodContainer.push({
				key: method,
				value: propObject[method],
			});
		}
		return methodContainer;
	}

	/**
	 * Apply onCratedCallbacks
	 * @param  {Object} self
	 * @param  {Any} ...args
	 * @return {undefined}
	 */
	static applyOnCreatedCallback(self, ...args){
		if(self.$onCreated && self.$onCreated.length) {
			for(let $callback of self.$onCreated){
				$callback(self, ...args);
			}
		}
	}

	/**
	 * Returns custom element callbacks
	 * @return {Object}
	 */
	static getCustomCallbacks(){

		return Object.getOwnPropertyDescriptors({
			createdCallback: function(...args) {

				/**
				 * 1.) If no args and no parentElement then was called .create(). We can only
				 * skip the if-block if "createdCallback" was called through create manually.
				 *
				 * 2.) If no args and has parentElement it was created automatically from browser.
				 * This accours when the customelement-tag is placed in dom
				 */
				if(!args.length && !this.parentElement){
					return;
				}

				CustomElement.applyOnCreatedCallback(this, ...args);
				this.created ? this.created(...args) : null;

			},
			attachedCallback: function(...args) {
				this.attached ? this.attached() : null;
			},
			detachedCallback: function(...args) {
				this.detached ? this.detached() : null;
			},
			attributeChangedCallback: function(...args) {
				this.attributeChanged ? this.attributeChanged(...args) : null;
			},
		});

	}

	/**
	 * Create a class by given Constructor-Function, prototypeProrps and staticProps
	 * @param  {Function} Constructor
	 * @param  {Object} protoProps
	 * @param  {Object} staticProps
	 * @return {Function} Constructor
	 */
	static createClass(Constructor, protoProps, staticProps) {

		if (protoProps) CustomElement.defineProperties(Constructor.prototype, protoProps);
		if (staticProps) CustomElement.defineProperties(Constructor, staticProps);
		return Constructor;

	}

	/**
	 * Given Subclass inherits (extends) from superClass
	 * @param  {Function} subClass
	 * @param  {Function} superClass
	 * @return {Function} subClass
	 */
	static inherits(subClass, superClass) {

		if (typeof superClass !== "function" && superClass !== null) {
			throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
		}

		subClass.prototype = Object.create(superClass && superClass.prototype, {
			constructor: {
				value: subClass,
				enumerable: false,
				writable: true,
				configurable: true
			}
		});

		if (superClass){
			Object.setPrototypeOf
				? Object.setPrototypeOf(subClass, superClass)
				: subClass.__proto__ = superClass;
		}

		return subClass;
	}

	/**
	 * Sets properties to given target
	 * @param  {Function|Object} target
	 * @param  {Object} props
	 * @return {undefined}
	 */
	static defineProperties(target, props){

		for (var i = 0; i < props.length; i++) {
			var descriptor = props[i];
			descriptor.enumerable = descriptor.enumerable || false;
			descriptor.configurable = true;
			if ("value" in descriptor) descriptor.writable = true;
			Object.defineProperty(target, descriptor.key, descriptor);
		}
	}

	/**
	 * returns instance methods of a Function-Class
	 * @param  {Object} ClassComponent
	 * @return {Array}
	 */
	static getInstanceMethods(ClassComponent) {
		let prototype = CustomElement.getPrototype(ClassComponent);
		return CustomElement.extractProperties(prototype, { ignore: /constructor/ });
	}

	/**
	 * returns static methods of a Function-Class
	 * @param  {Function} ClassComponent
	 * @return {Array}
	 */
	static getStaticMethods(ClassComponent) {
		let constructor = CustomElement.getConstructor(ClassComponent);
		return CustomElement.extractProperties(constructor, { ignore: /length|name|prototype|arguments|caller/ });
	}

	/**
	 * Return prototype by given Function-Class
	 * @param  {Function} ClassComponent
	 * @return {Object}
	 */
	static getPrototype(ClassComponent){
		return ClassComponent.prototype || ClassComponent.__proto__ || null;
	}

	/**
	 * Return classname by given Function-Class
	 * @param  {Function} ClassComponent
	 * @return {String}
	 */
	static getClassName(ClassComponent) {
		let prototype = CustomElement.getPrototype(ClassComponent);
		return ( prototype !== null ? prototype.constructor.name : null );
	}

	/**
	 * Return constructor by given Function-Class
	 * @param  {Function} ClassComponent
	 * @return {Function}
	 */
	static getConstructor(ClassComponent) {
		let prototype = CustomElement.getPrototype(ClassComponent);
		return ( prototype !== null ? prototype.constructor : null );
	}

}
