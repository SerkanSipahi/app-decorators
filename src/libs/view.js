
import { Object } from 'core-js/library';

export default class View {

	constructor(config = {}){

		this._domNode = config.domNode;
		this._vars = config.vars;
		this._template = config.template;
		this._renderer = config.renderer;
		this._uid = config.uid;
	}

	/**
	 * Unique-Id
	 * @type {Number}
	 */
	_uid = 0;

	/**
	 * DomNode
	 * @type {HTMLElement}
	 */
	_domNode = HTMLElement;

	/**
	 * View Vars
	 * @type {Object}
	 */
	_vars = {};

	/**
	 * View Template
	 * @type {String}
	 */
	_template = '';

	/**
	 * Precompiled View-Template
	 * @type {Function}
	 */
	_compiled = {};

	/**
	 * Set view var
	 * @param {String|Object} property
	 * @param {String|undefined} value
	 * @return undefined
	 */
	set(property, value) {
		if(Object.isObject(property)){
			Object.assign(this._vars, property);
		}
		else {
			this._vars[property] = value;
		}
	}

	/**
	 * Render view
	 * @param  {Object} passedVars
	 * @param  {String} name
	 * @return {undefined}
	 */
	render(passedVars = {}, name = 'base'){

		let tmpLocalViewVars = {};
		// merge passed passedViewVars into localViewVars
		Object.assign(tmpLocalViewVars, this._vars, passedVars);
		// compile template if not yet done
		if(!this._compiled[name]) {
			this._compiled[name] = this._renderer.compile(this._template[name]);
		}
		// write template into dom
		this._domNode.innerHTML = this._compiled[name](tmpLocalViewVars);
	}

}
