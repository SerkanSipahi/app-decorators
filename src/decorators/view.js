
// internal libs
import { View } from '../libs/view';
import { extractDomProperties } from '../helpers/extract-dom-properties';

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
			let domViewAttributes = extractDomProperties(
				domNode, /^@view\.bind\.(\S+)$/i, true
			);

			// get the restof regular attributes
			let regularDomAttributes = extractDomProperties(domNode);

			let viewBinds = JSON.parse(JSON.stringify(domNode.$.config.view.bind));

			let viewVars = Object.assign({},
				viewBinds,
				domViewAttributes,
				createVars,
				regularDomAttributes
			);

			// initialize view
			let $view = View.create({
				rootNode: domNode,
				templateNode: document.createElement('div'),
				vars: viewVars,
				renderer: Handlebars,
				createElement: document.createElement.bind(document),
				template: domNode.$.config.view.template[templateName],
			});

			view.helper.registerSetGet(
				domNode,
				Object.assign({}, domNode.$.config.view.bind, domViewAttributes)
			);

			// render view
			$view.render(null, { renderedFlag });

			domNode.$view = $view;

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

	},

	/**
	 * registerSetGet
	 * @param target
	 * @param viewBinds
	 * @returns {Object} target
     */
	registerSetGet: (target, viewBinds) => {

		// make viewBinds immutable
		viewBinds = JSON.parse(JSON.stringify(viewBinds));

		// prepare property proxy setter
		let properties = {};
		for(let property in viewBinds){
			properties[property] = {
				set: function(newValue){
					this.$view.set(property, newValue);
					this.$view.render(null, {force: true});
				},
				get: function(){
					return this.$view.get(property);
				}
			}
		}

		// prepare render proxy to $.view
		properties.render = {
			value: function(...args) {
				this.$view.set(...args);
				this.$view.render(null, {force: true});
			}
		};


		Object.defineProperties(target, properties);

		return target;

	},

};

export {
	view
};
