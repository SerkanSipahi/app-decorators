
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
		view.setRootNode(config.rootNode);
		view.setTemplateNode(config.templateNode);
		view.setRenderer(config.renderer);
		view.setTemplate(config.template);
		view.set(config.vars);

		return view;

	}

	/**
	 * el (alias for _rootNode)
	 * @type {Element}
	 */
	el = null;

	/**
	 * _rootNode
	 * @type {Element}
	 */
	_rootNode = null;

	/**
	 * _templateNode
	 * @type {Element}
	 */
	_templateNode = [];

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
	 * setRootNode
	 * @param {Element} rootNode
	 */
	setRootNode(rootNode){

		if(!rootNode instanceof Element){
			throw new Error('Allowed is domNode as argument');
		}

		this._rootNode = rootNode;

	}

	/**
	 * Returns _templateNode
	 * @return {Element}
	 */
	getTemplateNode(){
		return this._templateNode;
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
	 * @param {Element} domNode
	 */
	setTemplateNode(templateNode) {

		if(!templateNode instanceof Element){
			throw new Error('Allowed is domNode as argument');
		}

		this._templateNode = templateNode;
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
	render(passedVars = {}, { templateName = 'base', force = false, renderedFlag = true } = {}){

		let tmpLocalViewVars = {};
		// merge passed passedViewVars into localViewVars
		Object.assign(tmpLocalViewVars, this._vars, passedVars);

		// do nothing if already rendered
		if(this.getAttribute(this._rootNode, 'rendered') && !force){
			return this;
		}

		if(force){
			this._rootNode.innerHTML = '';
		}

		// compile template if not yet done
		if(!this.isCompiled(templateName)) {
			this._compiled[templateName] = this.compile(templateName);
		}

		// keep rendered template
		this.renderedTemplate = this._compiled[templateName](tmpLocalViewVars);
		// write template into dom
		this._templateNode.innerHTML = this.renderedTemplate;
		// append templateNode to _rootNode
		this._appendTo(this._templateNode, this._rootNode);
		// el is alias for _rootNode
		this.el = this._rootNode;

		// set rendered flag
		if(renderedFlag){
			this.setAttribute(this._rootNode, 'rendered', renderedFlag);
		}

		return this;

	}

	/**
	 * compile
	 * @param  {String} templateName
	 * @return {Function}
	 */
	compile(templateName){

		return this._renderer.compile(this._template[templateName]);

	}

	/**
	 * isCompiled
	 * @param  {String} templateName
	 * @return {Boolean}
	 */
	isCompiled(templateName){

		return this._compiled[templateName];

	}

	/**
	 * getAttribute
	 * @param  {domNode} domNode
	 * @param  {String} value
	 * @return {Any}
	 */
	getAttribute(domNode, value){

		if(!domNode instanceof Element){
			throw new Error('Allowed is domNode as argument');
		}

		return domNode.getAttribute(value);

	}

	/**
	 * setAttribute
	 * @param {element} domNode
	 * @param {string} name
	 * @param {string|number} value
	 */
	setAttribute(domNode, name, value){

		if(!domNode instanceof Element){
			throw new Error('Allowed is domNode as argument');
		}

		domNode.setAttribute(name, value);

	}

	/**
	 * replaceNode
	 * @param  {oldNodeSelector} selector
	 * @param  {Element} newNode
	 * @return {undefined}
	 */
	replaceNode(oldNodeSelector, newChild) {

		let oldChild = this._rootNode.querySelector(oldNodeSelector);
		if(!oldChild) {
			throw new Error('Replace node doesnt exists');
		}

		oldChild.parentNode.replaceChild(newChild, oldChild);

	}

	/**
	 * _appendTo
	 * @param  {Element} rootNode
	 * @return {Undefined}
	 */
	_appendTo(templateNode, rootNode){

		if(templateNode && templateNode.childNodes){
			let childNodesArray = [].slice.call(templateNode.childNodes);
			for(let childNode of childNodesArray) {
				rootNode.appendChild(childNode);
			}
		}

	}

}
