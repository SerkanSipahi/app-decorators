
export default class CustomElement {

	/**
	 * Register an element by give ES5/ES6 Class
	 * @param  {Function} ComponentClass
	 * @param  {Element} DOMElement
	 * @return {undefined}
	 */
	static register(ComponentClass, DOMElement = HTMLElement) {

		// preparing custom element
		let ComponentPrototye = {};
		let componentClassName = ComponentClass.prototype.constructor.name;
		let validComponentName = CustomElement.convertToValidComponentName(componentClassName);

		// buildComponent
		let builtComponent = CustomElement.buildComponent(ComponentClass, DOMElement);

		// register element
		let ComElement = document.registerElement(validComponentName, builtComponent);

		// factory for creating custom element
		ComponentClass.instance = function(){
			return new ComElement();
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

		let className = true;
		let resolvedClass = ComponentClass;
		let explodedExtends = [];
		while(className){
			resolvedClass = CustomElement.resolveClassInComponents(
				!(2 in resolvedClass) ? resolvedClass : resolvedClass[2]
			);
			className = resolvedClass[0];
			if(!className) {
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
		// __proto__ must be refactored
		let proto = ClassComponent.prototype || ClassComponent.__proto__ || null;
		let className = proto !== null ? proto.constructor.name : null;
		let constructor = proto !== null ? proto.constructor : null;

		// if reached className is "Object" set "see inside block" to null
		if(className === 'Object'){
			proto = className = constructor = null;
		}

		// preparing instance and static methods for createClass
		// must be refactored
		if(constructor && proto && className !== 'Object'){
			instanceMethods = CustomElement.extractProperties(proto, /constructor/);
			staticMethods = CustomElement.extractProperties(constructor, /length|name|prototype/);
		}

		return [ className, constructor, proto, instanceMethods, staticMethods ];
		// return [ className, constructor, proto ];
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
		let [ ,Constructor,,instanceMethods,staticMethods] = collection.pop();

		if(Constructor && DOMElement){
			CustomElement.inherits(Constructor, DOMElement);
			CustomElement.createClass(Constructor, instanceMethods, staticMethods);
		}

		if(!collection.length) {
			return Constructor;
		}

		// extended behavoir of function: if class has any parent classes
		while(collection.length) {
			let [ ,FirstConstructor,,instanceMethods,staticMethods] = collection.pop();
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

}
