
export default class CustomElement {

	static register(ComponentClass, DOMElement = HTMLElement) {

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

	static convertToValidComponentName(name, prefix = 'com') {
		return `${prefix}-${name.toLowerCase()}`;
	}
}
