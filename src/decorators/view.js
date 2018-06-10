import { View } from '../libs/view';
import { extractDomProperties } from '../helpers/extract-dom-properties';
import { initCoreMap, initViewMap } from '../datas/init-maps';
import { storage } from '../libs/random-storage';
import { HandlebarsRuntime } from '../libs/dependencies';

/*****************************************
 * ######### Public Decorators ###########
 *****************************************/

/**
 * Register View
 * @param  {String} template
 * @param  {Object} options
 * @return {Function}
 */
function view(template, options = {}) {

	if(!template) {
		throw new Exception('Please pass a template!');
	}

	return Class => {

		let renderedFlag = !(options.renderedFlag === false);

		initCoreMap(storage, Class);
		initViewMap(storage, Class);

		let map = storage.get(Class);

		/**
		 * Its required when we use @style multiple times!
		 * Only once registration!
		 */
		if(map.get('@view').get('callbacksDefined')){
			return;
		}

		map.get('@callbacks').get('created').push((domNode, createVars = {}) => {

			// get and merge dom view var attributes
			let domViewAttributes = extractDomProperties(
				domNode, /^@view\.bind\.(\S+)$/i, true
			);

			// get the restof regular attributes
			let regularDomAttributes = extractDomProperties(domNode);

			let viewBinds = {};
			let entries = map.get('@view').get('bind');
			entries.forEach(([key, value]) => viewBinds[key] = value);

			let viewVars = Object.assign({},
				viewBinds,
				domViewAttributes,
				createVars,
				regularDomAttributes
			);

			// initialize view
			let $view = new View({
				prerenderer: HandlebarsRuntime.template,
				rootNode: domNode,
				vars: viewVars,
				template: template,
			});

			view.helper.registerSetGet(
				domNode,
				Object.assign({}, viewBinds, domViewAttributes)
			);

			// render view
			$view.render(null, {
				renderedFlag: renderedFlag,
			});

			domNode.$view = $view;
		});

		map.get('@callbacks').get('attached').push(domNode => {

			if(domNode.$view.initialized()){
				return;
			}

			/**
			 * Using the same instance is 30% faster in
			 * (Chrome, Opera) and no difference in Firefox
			 * @see: https://jsperf.com/new-class-vs-singleton
			 */
			domNode.$view.reinit({
				rootNode: domNode,
				prerenderer: HandlebarsRuntime.template,
			});
		});

		map.get('@callbacks').get('detached').push(domNode => {
			domNode.$view.destroy();
		});

		map.get('@view').set('callbacksDefined', true);
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

	let Class = target.constructor;

	initCoreMap(storage, Class);
	initViewMap(storage, Class);

	// get default value
	let value = descriptor.initializer ? descriptor.initializer() : '';

	// register view binds
	let map = storage.get(Class);
	map.get('@view').get('bind').push([property, value]);

};

/*****************************************
 * ########## Decorator Helper ###########
 *****************************************/

view.helper = {

	/**
	 * registerSetGet
	 * @param target
	 * @param viewBinds
	 * @returns {Object} target
     */
	registerSetGet(target, viewBinds) {

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
