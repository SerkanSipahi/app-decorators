

class CustomElement {

	static register(ComponentClass, DOMElement) {

		let ComponentPrototye = CustomElement.extractPrototype(ComponentClass);
		let componentClassName = ComponentClass.prototype.constructor.name;
		let validComponentName = CustomElement.convertToValidComponentName(componentClassName);
		let ComElement = document.registerElement(validComponentName, {
			prototype: Object.create(
				DOMElement.prototype,
				ComponentPrototye
			)
		});

		ComponentClass.instance = function(){
			return new ComElement();
		};
	}

	static extractPrototype(Component) {

	    let componentOrigProto = Component.prototype;
	    let componentOrigProperties = Reflect.ownKeys(componentOrigProto);
	    let componentTmpProto = {};

		for(let method of componentOrigProperties){
			if(method === 'constructor'){
				continue;
			}
			componentTmpProto[method] = {
				value: Component.prototype[method]
			};
	    }

		return componentTmpProto;
	}

	static convertToValidComponentName(name) {
		return name.replace( /([a-z])([A-Z])/g, '$1-$2' ).toLowerCase();
	}
}

/**
 * Component (CustomElement)
 *
 * @param  {Any} ...args
 * @return {Function}
 */
export default function component(DOMElement = HTMLDivElement) {
	return function decorator(ComponentClass) {
		CustomElement.register(ComponentClass, DOMElement);
	}
}
