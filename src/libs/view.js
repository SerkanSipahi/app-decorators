
// external libs
import { Object } from 'core-js/library';

// internal libs
import uuid from '../helpers/uuid';

export default class View {

	/**
	 * Create an instance of View Class
	 * @param  {Object} config
	 * @return {Object}
	 */
	static create(config = {}){

		// init view
		let view = new View();
		// setup view
		view.setDomNode(config.domNode);
		view.setRenderer(config.renderer);
		view.setTemplate(config.template);
		view.set(config.vars);

		return view;

	}

	/**
	 * constructor
	 * @return {undefined}
	 */
	constructor(){
		this._uid = uuid();
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
	_domNode = null;

	/**
	 * View Vars
	 * @type {Object}
	 */
	_vars = {};

	/**
	 * View Template
	 * @type {Object}
	 */
	_template = {};

	/**
	 * Precompiled View-Template
	 * @type {Function}
	 */
	_compiled = {};

	/**
	 * rendered template
	 * @type {String}
	 */
	rendered = '';

	/**
	 * Excract domnode attributes
	 * @param  {HTMLElement} domNode
	 * @return {Object}
	 */
	static extractViewVarFromDomAttributes(domNode){

		let domViewAttributes = {};
		let toBeRemovedAttributes = [];
		for(let key in Object.keys(domNode.attributes)) {

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

		return domViewAttributes;
	}

	/**
	 * Set view var
	 * @param {String|Object} property
	 * @param {String|undefined} value
	 * @return {this}
	 */
	set(property, value) {

		let classOf = Object.classof(property);

		if(!/Object|String/.test(classOf)){
			throw new Error('Allowed is string or object as arguments');
		}

		if(classOf === 'Object'){
			Object.assign(this._vars, property);
		}
		if(classOf === 'String'){
			this._vars[property] = value;
		}

		return this;

	}

	/**
	 * Returns view vars
	 * @param {String} property
	 * @return {Any}
	 */
	get(property){

		let classOf = Object.classof(property);

		if(!/String/.test(classOf)){
			throw new Error('Allowed is string as argument');
		}

		return this._vars[property];
	}

	/**
	 * Return view vars
	 * @return {Object}
	 */
	getVars(){
		return this._vars;
	}

	/**
	 * Returns domNode
	 * @return {HTMLElement}
	 */
	getDomNode(){
		return this._domNode;
	}

	/**
	 * Define template
	 * @param {String} template
	 * @param {String} name
	 */
	setTemplate(template = null, name = 'base'){

		let classOf = Object.classof(template);

		if(!/String/.test(classOf)){
			throw new Error('Allowed is string as argument');
		}

		this._template[name] = template;
	}

	/**
	 * Set domeNode
	 * @param {HTMLElement} domNode
	 */
	setDomNode(domNode) {

		if(!domNode instanceof HTMLElement){
			throw new Error('Allowed is domNode as argument');
		}

		this._domNode = domNode;
	}

	setUniqueId(uid){
		this._uid = uid;
	}

	/**
	 * Set renderer
	 * @param {Any} renderer
	 */
	setRenderer(renderer) {
		this._renderer = renderer;
	}

	/**
	 * Render view
	 * @param  {Object} passedVars
	 * @param  {String} name
	 * @return {this}
	 */
	render(passedVars = {}, name = 'base'){

		let tmpLocalViewVars = {};
		// merge passed passedViewVars into localViewVars
		Object.assign(tmpLocalViewVars, this._vars, passedVars);
		// compile template if not yet done
		if(!this._compiled[name]) {
			this._compiled[name] = this._renderer.compile(this._template[name]);
		}

		// keep rendered template
		this.rendered = this._compiled[name](tmpLocalViewVars);
		// write template into dom
		this._domNode.innerHTML = this.rendered;

		return this;

	}

}
