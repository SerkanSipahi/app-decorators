
// external libs
import { Object, Reflect } from 'core-js/library';

export default class CustomElement {

	/**
	 * Register an element by give ES5/ES6 Class
	 * @param  {Function} ComponentClass
	 * @param  {Element} DOMElement
	 * @return {undefined}
	 */
	static register(ComponentClass, DOMElement = HTMLElement, prefix) {

		// extract useful properties
		let componentClassName  = CustomElement.getClassName(ComponentClass);
		let validComponentName  = CustomElement.convertToValidComponentName(componentClassName, prefix);

		// buildComponent
		DOMElement = CustomElement.buildComponent(ComponentClass, DOMElement);

		// register element
		let customCallbacks = CustomElement.getCustomCallbacks();
		let ComElement = document.registerElement(validComponentName, {
			prototype: Object.create(DOMElement.prototype, customCallbacks),
			// extends: 'div',
		});

		// create static factory method for creating dominstance
		ComponentClass.create = function($create_vars = null){

			// override constructor
			/**
			 * Nativ CustomElements doesnt allow to use a constructor
			 * therefore if constructor is added by the user we override that
			 * otherwise an error could be thrown.
			 *
			 */
			this.constructor = function(){};

			// extract and assign instance properties
			/**
			 * At the moment we cant extract class properties from prototype
			 * because it not visible there. Babel convert this:
			 *
			 * class Item {
			 *    prop1 = 123; // <- cant extract it directly (from prototype)
			 * }
			 *
			 * to:
			 *
			 * function Item(){
			 *    this.prop1 = 123; // <- we dont know how we get this.prop1 from there
			 * }
			 *
			 */
			let tmpInstanceProperties = new ComponentClass();
			let instanceProperties = {};
			for(let property of Reflect.ownKeys(tmpInstanceProperties)){
				instanceProperties[property] = tmpInstanceProperties[property];
			}
			let comElement = new ComElement();
			Object.assign(comElement, instanceProperties);

			// cleanup
			tmpInstanceProperties = null;
			instanceProperties = null;
			// end of extracting and assign of instance properties

			comElement.createdCallback($create_vars);

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
	 * @param  {Regex} exclude
	 * @return {Array} methodContainer
	 */
	static extractProperties(propObject, exclude = false){

		let methodContainer = [];
		for(let method of Reflect.ownKeys(propObject)) {
			if(exclude && method.match(exclude)) {
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

		return {
			createdCallback: {value: function(...args){

				/**
				 * 1.) return if native instantiating (with new) of custom element.
				 * See CustomElement.register => .create(). What we want is to pass arguments
				 * through .create() (see tests view.spec.js) therefore
				 * we have to do that manually (see CustomElement.register .create() => createdCallback)
				 *
				 * 2.) If createdCallback has not args and has parentElement, the CustomElement
				 * its instantiated from browser itself ! Also, no used fooCustomElement.create().
				 * The element was in dom, is already exists there e.g.:
				 * <body>
				 *     <com-foo></com-foo>
				 *     <com-foo></com-foo>
				 * </body>
				 */
				if(!args.length && !this.parentElement){
					return;
				}

				CustomElement.applyOnCreatedCallback(this, ...args);
				this.created ? this.created(...args) : null;
			}},
			attachedCallback: {value: function(){
				this.attached ? this.attached() : null;
			}},
			detachedCallback: {value: function(){
				this.detached ? this.detached() : null;
			}},
			attributeChangedCallback: {value: function(...args){
				this.attributeChanged ? this.attributeChanged(...args) : null;
			}},
		}
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
		return CustomElement.extractProperties(prototype, /constructor/);
	}

	/**
	 * returns static methods of a Function-Class
	 * @param  {Function} ClassComponent
	 * @return {Array}
	 */
	static getStaticMethods(ClassComponent) {
		let constructor = CustomElement.getConstructor(ClassComponent);
		return CustomElement.extractProperties(constructor, /length|name|prototype/);
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
