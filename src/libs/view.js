let classof = value => {
	return Object.prototype.toString.call(value).slice(8, -1);
};

class View {

	/**
	 * Create an instance of View Class
	 * @param  {Object} config
	 * @return {Object}
	 */
	static create(config){

		if(classof(config) !== 'Object') {
			throw new Error('Passed Object must be an object {}');
		}

		// init view
		let view = new View();
		// setup view
		view.setRootNode(config.rootNode);
		view.setTemplateNode(config.templateNode);
		view.setRenderer(config.renderer);
		view.setElementCreater(config.createElement);
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
	 * _origs
	 * @type {Object}
	 */
	_origs = {};

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
	 * _slot description
	 * @type {String}
	 */
	_slot = 'slot';

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

		let classOf = classof(property);

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

		let classOf = classof(property);

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

		let classOf = classof(template);

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
	 * setElementCreater
	 * @param {function} func
	 */
	setElementCreater(func) {
		this._createElement = func;
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
			this.trigger('view-already-rendered');
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

		let innerRootNodes = this._createElement('inner-root-nodes');
		let innerComponentNode = this._templateNode.querySelector(this._slot);
		if(innerComponentNode) {
			this.appendChildNodesTo(this._rootNode, innerRootNodes);
		}

		// append templateNode to _rootNode
		this.appendChildNodesTo(this._templateNode, this._rootNode);
		// el is alias for _rootNode
		this.el = this._rootNode;

		// if slot exists
		innerComponentNode = this._rootNode.querySelector(this._slot);
		if(innerComponentNode){
			this.appendChildNodesTo(innerRootNodes, innerComponentNode);
		}

		// set rendered flag
		if(renderedFlag){
			this.setAttribute(this._rootNode, 'rendered', renderedFlag);
			this.trigger('view-rendered');
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
	 * getRootNode
	 * @return {Element}
	 */
	getRootNode(){

		return this._rootNode;

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
	 * appendChildNodesTo
	 * @param  {Element} targetNode
	 * @return {Undefined}
	 */
	appendChildNodesTo(domNode, targetNode){

		while (domNode.childNodes.length > 0) {
		    targetNode.appendChild(domNode.childNodes[0]);
		}

	}

	/**
	 * trigger
	 * @param  {String} event
	 * @return {Undefined}
	 */
	trigger(type){
		let event = new Event(type);
		this._rootNode.dispatchEvent(event);
	}

}

export {
	View
};
