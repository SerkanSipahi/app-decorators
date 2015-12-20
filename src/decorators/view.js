
// internal libs
import View from '../libs/view';

// external libs
import { Object } from 'core-js/library';

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

	return function(Class, name) {

		let target = Class.prototype;

		// define namespaces
		if(!target.$appDecorators){
			target.$appDecorators = {};
		}
		if(!target.$appDecorators.view){
			target.$appDecorators.view = {};
		}
		if(!target.$appDecorators.view.template){
			target.$appDecorators.view.template = {};
		}

		// add template
		target.$appDecorators.view.template[templateName] = template;

		// define $onCreated callbacks
		if(!target.$onCreated) {
			target.$onCreated = [];
		}

		// init render engine
		target.$onCreated.push(function(domNode, createVars = {}){

			if(!domNode.$){
				domNode.$ = {};
			}
			domNode.$.view = new View({
				domNode: domNode,
				vars: Object.assign({}, domNode.$appDecorators.view.bind, createVars),
				template : {
					base: target.$appDecorators.view.template[templateName],
				},
			});

			domNode.render = domNode.$.view.render.bind(domNode);
			domNode.$.view.render();

		});

		// init proxy to viewengine
		target.$onCreated.push(function(domNode){

			let properties = {};
			for(let property in target.$appDecorators.view.bind){
				properties[property] = {
					set: function(newValue){
						this.$.view.set(property, newValue);
						this.$.view.render();
					}
				}
			}
			// register setter (@view.bind properties)
			Object.defineProperties(domNode, properties);

		});

	}
};

/**
 * Register view vars
 * @param  {Object} target
 * @param  {String} property
 * @param  {Object} descriptor
 * @return {undefined}
 */
view.bind = function(target, property, descriptor){

	// define namespaces
	if(!target.$appDecorators){
		target.$appDecorators = {};
	}
	if(!target.$appDecorators.view){
		target.$appDecorators.view = {};
	}
	if(!target.$appDecorators.view.bind){
		target.$appDecorators.view.bind = {};
	}

	// get default value
	let value = descriptor.initializer ? descriptor.initializer() : '';
	// define @view.bind property/value
	target.$appDecorators.view.bind[property] = value;

};

export default view;
