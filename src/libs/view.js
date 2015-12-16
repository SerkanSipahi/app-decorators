

// external libs
import Handlebars from 'handlebars';
import { Object } from 'core-js/library';

export default class View {

	/**
	 * Render-Helper
	 * @param  {Object} passedViewVars
	 * @param  {String} name
	 * @return {undefined}
	 */
	static render(passedViewVars = {}, name = 'base') {
		let localViewVars = {};
		// keep $view
		let $view = this.$view;
		// default vars
		let defaultVars = $view.defaultVars || {};
		// merge passed passedViewVars into localViewVars
		Object.assign(localViewVars, this.$bindproperties, $view.vars, passedViewVars);
		// compile template if not yet done
		if(!$view.compiled[name]) {
			$view.compiled[name] = Handlebars.compile($view.template[name]);
		}
		// write template into dom
		this.innerHTML = $view.compiled[name](localViewVars);
	};

	/**
	 * Register-Template
	 * @param  {Function} Class
	 * @param  {String} template
	 * @return {undefined}
	 */
	static registerTemplate(Class, template, name = 'base'){

		let target = Class.prototype;
		target.$callbacks = [];

		// init $view options
		target.$callbacks.push(function(root, create_vars){

			!root.$view ? root.$view  = {} : null;
			!root.$view.vars ? root.$view.vars  = {} : null;
			!root.$view.template ? root.$view.template  = {} : null;
			!root.$view.compiled ? root.$view.compiled = {} : null;

			root.$view.template[name] = template;
			root.$view.render = View.render.bind(root);

			root.$view.vars = create_vars;
			root.$view.render();

		});

		// init setter for bind properties
		target.$callbacks.push(function(root, create_vars){

			let properties = {};
			for(let property in root.$bindproperties){
				// init setter
				properties[property] = {
					set: function(newValue){
						this.$view.render({[property]: newValue});
					}
				}
			}
			Object.defineProperties(root, properties);

		});

	}

	/**
	 * Bind
	 * @param  {Object} target
	 * @param  {String} name
	 * @return {String} defaultValue
	 */
	static bind(target, name, defaultValue){

		!target.$bindproperties ? target.$bindproperties = {} : null;
		target.$bindproperties[name] = defaultValue;

	}
}
