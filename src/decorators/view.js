
// internal libs
import View from '../libs/view';

// external libs
import { Object } from 'core-js/library';
import Handlebars from 'handlebars';
import uuid from '../helpers/uuid';

/*****************************************
 * ######### Public Decorators ###########
 *****************************************/

/**
 * Register View
 * @param  {String} template
 * @param  {String} templateName
 * @return {Function}
 */
function view(template, templateName = 'base') {

	if(!template) {
		throw new Exception('Please pass a template!');
	}

	return (Class, name) => {

		let target = Class.prototype;

		// register Template
		view.helper.registerTemplate(target, template, templateName);

		// register view engine that initialized on called createdCallback
		view.helper.registerOnCreatedCallback(target, ( domNode, createVars = {} ) => {

			// extract dom attributes
			let domViewAttributes = {};
			let toBeRemovedAttributes = [];
			for(let key in Object.keys(domNode.attributes)) {
				// extract @view.bind.n="foo" property
				let node = domNode.attributes[key];
				let matched = /^@view\.bind\.(\S+)$/gi.exec(node.name);
				if(matched !== null) {
					let [ ,name ] = matched;
					domViewAttributes[name] = node.value;
					toBeRemovedAttributes.push(node.name);
				}
			}

			// remove dom attributes
			for(let attribute of toBeRemovedAttributes){
				domNode.removeAttribute(attribute);
			}

			let view = View.create({
				uuid: uuid(),
				domNode: domNode,
				vars: Object.assign({}, domNode.$appDecorators.view.bind, domViewAttributes, createVars),
				renderer: Handlebars,
				template: domNode.$appDecorators.view.template[templateName],
			});

			// define namespace for view
			domNode.$ ? null : domNode.$ = {};
			domNode.$.view = view;

			// render view
			domNode.$.view.render();

		});

		// register proxy that initialized on called createdCallback
		view.helper.registerOnCreatedCallback(target, ( domNode, createVars = {} ) => {

			// prepare property proxy setter
			let properties = {};
			for(let property in target.$appDecorators.view.bind){
				properties[property] = {
					set: function(newValue){
						this.$.view.set(property, newValue);
						this.$.view.render();
					},
					get: function(newValue){
						return this.$.view.get(property);
					}
				}
			}

			// prepare render proxy to $.view
			properties.render = {
				value: function(...args) {
					this.$.view.set(...args);
					this.$.view.render();
				}
			}

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
	view.helper.registerBind(target, property, value);

};

/*****************************************
 * ########## Decorator Helper ###########
 *****************************************/

// define namespace
view.helper = {};

/**
 * Register @bind of view decorator
 * @param  {Function|Objet} target
 * @param  {String} property
 * @param  {String} value
 * @return {Object} target
 */
view.helper.registerBind = (target, property, value) => {

	// define namespaces
	view.helper.registerNamespaces(target);

	// define @view.bind property/value
	target.$appDecorators.view.bind[property] = value;

	return target;

};

/**
 * Register @bind of view decorator
 * @param  {Function|Objet} target
 * @param  {String} template
 * @param  {String} templateName
 * @return {Function} target
 */
view.helper.registerTemplate = (target, template, templateName = 'base') => {

	// define namespaces
	view.helper.registerNamespaces(target);

	// add template
	target.$appDecorators.view.template[templateName] = template;

	return target;

};

/**
 * Register on created callback
 * @param  {[type]}   target   [description]
 * @param  {Function} callback [description]
 * @return {Function} target
 */
view.helper.registerOnCreatedCallback = (target, callback) => {

	// define $onCreated callbacks
	if(!target.$onCreated) {
		target.$onCreated = [];
	}

	// init render engine
	target.$onCreated.push(callback);

	return target;

};

/**
 * Register namespace of view decorator
 * @param  {Function|Objet} target
 * @return {Function} target
 */
view.helper.registerNamespaces = (target) => {

	// if namespace already exists do nothing
	if(target.$appDecorators && target.$appDecorators.view){
		return target;
	}

	// define namespace
	target.$appDecorators = {
		view: {
			bind: {},
			template: {},
		},
	};

	return target;
};

export default view;
