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
		Class.prototype.createdCallback = function(...args){

			if(!args.length && !this.parentElement){
				return;
			}
			createdCallback ? this::createdCallback(...args) : null;
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

			element.createdCallback(vars || "");
			return element;
		};

		return Class;
	}
};

export {
	Register,
};
