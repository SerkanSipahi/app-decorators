
// internal libs
import { View } from '../libs/view';
import { extractDecoratorProperties } from '../helpers/extract-decorator-properties';

// external libs
import { Handlebars } from '../libs/dependencies';

/*****************************************
 * ######### Public Decorators ###########
 *****************************************/

/**
 * Register View
 * @param  {String} template
 * @param  {Object<templateName, renderedFlag} templateName
 * @return {Function}
 */
function view(template, options = {}) {

	if(!template) {
		throw new Exception('Please pass a template!');
	}

	return (Class, name) => {

		let target = Class.prototype;

		let templateName = options.templateName || 'base';
		let renderedFlag = options.renderedFlag === false ? false : true;

		// define namespaces
		view.helper.registerNamespaces(target);

		// register Template
		view.helper.registerTemplate(target, template, templateName);

		// register view engine that initialized on called createdCallback
		view.helper.registerCallback('created', target, ( domNode, createVars = {} ) => {

			// get and merge dom view var attributes
			let domViewAttributes = extractDecoratorProperties(domNode, '@view.bind', true);
			Object.assign(domNode.$.config.view.bind, domViewAttributes);

			// get the restof regular attributes
			let regularDomAttributes = extractDecoratorProperties(domNode);

			// initialize view
			let view = View.create({
				rootNode: domNode,
				templateNode: document.createElement('div'),
				vars: Object.assign({}, domNode.$.config.view.bind, createVars, regularDomAttributes),
				renderer: Handlebars,
				createElement: document.createElement.bind(document),
				template: domNode.$.config.view.template[templateName],
			});

			// keep instance of view
			domNode.$.instance.view = view;

			// render view
			view.render(null, { renderedFlag });

		});

		// register proxy that initialized on called createdCallback
		view.helper.registerCallback('created', target, ( domNode, createVars = {} ) => {

			// prepare property proxy setter
			let properties = {};
			for(let property in domNode.$.config.view.bind){
				properties[property] = {
					set: function(newValue){
						this.$.instance.view.set(property, newValue);
						this.$.instance.view.render(null, {force: true});
					},
					get: function(){
						return this.$.instance.view.get(property);
					}
				}
			}

			// prepare render proxy to $.view
			properties.render = {
				value: function(...args) {
					this.$.instance.view.set(...args);
					this.$.instance.view.render(null, {force: true});
				}
			};

			// register setter (@view.bind properties and .$.view.render method)
			Object.defineProperties(domNode, properties);

		});

	}
}

/**
 * Register view vars
 * @param  {Object} target
 * @param  {String} property
 * @param  {Object} descriptor
 * @return {undefined}
 */
view.bind = (target, property, descriptor) => {

	// get default value
	let value = descriptor.initializer ? descriptor.initializer() : '';

	if(Object.classof(value) !== 'String'){
		throw new Error('The value of @view.bind must be an String');
	}

	// define namespaces
	view.helper.registerNamespaces(target);

	// register view binds
	view.helper.registerBind(target, property, value);

};

/*****************************************
 * ########## Decorator Helper ###########
 *****************************************/

// define namespace
view.helper = {

	/**
	 * Register namespace of view decorator
	 * @param  {Function|Objet} target
	 * @return {Function} target
	 */
	registerNamespaces: (target) => {

		// register "root" namespace
		if(!target.$) target.$ = {};

		// register "config" namespace
		if(!target.$.config) target.$.config = {};

		// register "on" namespace
		if(!target.$.config.view) {
			target.$.config.view = {
				bind: {},
				template: {},
			};
		}

		// register webcomponent "lifecycle" namespace
		if(!target.$.webcomponent) {
			target.$.webcomponent = {
				lifecycle: {
					created: [],
					attached: [],
					detached: [],
				},
			};
		}

		// register "instance" namespace
		if(!target.$.instance) target.$.instance = {};

		return target;

	},

	create: (target, ...args) => {

		target.$.webcomponent.lifecycle.created.forEach(callback => {
			callback(target, ...args);
		});

		return target;

	},

	/**
	 * Register @bind of view decorator
	 * @param  {Function|Objet} target
	 * @param  {String} property
	 * @param  {String} value
	 * @return {Object} target
	 */
	registerBind: (target, property, value) => {

		// define @view.bind property/value
		target.$.config.view.bind[property] = value;

		return target;

	},

	/**
	 * Register @bind of view decorator
	 * @param  {Function|Objet} target
	 * @param  {String} template
	 * @param  {String} templateName
	 * @return {Function} target
	 */
	registerTemplate: (target, template, templateName = 'base') => {

		// add template
		target.$.config.view.template[templateName] = template;
		return target;

	},

	/**
	 * Helper for registering callbacks
	 * @param  {String} name
	 * @param  {Function} target
	 * @return {Function} callack
	 */
	registerCallback: (name, target, callback) => {

		target.$.webcomponent.lifecycle[name].push(callback);

		return target;

		// ucFirst
		name = name.charAt(0).toUpperCase()+name.slice(1);
		// its created something like onCreated if passed name=created
		target[`$on${name}`].view.push(callback);

		return target;

	},

};

export {
	view
};
