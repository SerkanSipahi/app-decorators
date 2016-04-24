
export default class View {

	/**
	 * Create an instance of View Class
	 * @param  {Object} config
	 * @return {Object}
	 */
	static create(config){

		if(Object.classof(config) !== 'Object') {
			throw new Error('Passed Object must be an object {}');
		}

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
	renderedTemplate = '';

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
	 * @param  {Object<templaeName, force}
	 * @return {this}
	 */
	render(passedVars = {}, { templateName = 'base', force = false } = {}){

		let tmpLocalViewVars = {};
		// merge passed passedViewVars into localViewVars
		Object.assign(tmpLocalViewVars, this._vars, passedVars);

		// do nothing if already rendered
		if(this._domNode.getAttribute('rendered') && !force){
			return this;
		}

		// compile template if not yet done
		if(!this._compiled[templateName]) {
			this._compiled[templateName] = this._renderer.compile(this._template[templateName]);
		}

		// keep rendered template
		this.renderedTemplate = this._compiled[templateName](tmpLocalViewVars);
		// write template into dom
		this._domNode.innerHTML = this.renderedTemplate;

		// set rendered flag
		if(this._renderedFlag){
			this._domNode.setAttribute('rendered', this._renderedFlag);
		}

		return this;

	}

	/**
	 * _renderedFlag
	 * @type {Boolean}
	 */
	_renderedFlag = true;

	/**
	 * _setRenderedFlagAfterRender description
	 * @param {[type]} boolean [description]
	 */
	_setRenderedFlagAfterRender(boolean) {
		this._renderedFlag = boolean;
	}

}
