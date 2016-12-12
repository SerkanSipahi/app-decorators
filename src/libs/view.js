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
		// setup view (should be call in this order)
		view.setRootNode(config.rootNode);
		view.setTemplateNode(config.templateNode);
		view.setPrecompiler(config.precompiler);
		view.setPrerenderer(config.prerenderer);
		view.setElementCreater(config.createElement);
		view.setRegex(config.regex);
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
	_templateNode = null;

	/**
	 * _regex
	 * @type {RegExp}
	 */
	_regex = /\{\{.*?\}\}/;

	/**
	 * View Vars
	 * @type {Object}
	 */
	_vars = {};

	/**
	 * _precompile
	 * @type {null}
	 */
	_precompile = null;

	/**
	 * _prerender
	 * @type {null}
	 */
	_prerender = null;

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
		return this;
	}

	/**
	 * Define template
	 * @param {string|object} template
	 * @param {string} name
	 */
	setTemplate(template = null, name = 'base'){

		if(this._template_withNoVars(template)){
			this.compile(template, 'basic', name);
		} else if(this._template_withVars(template)){
            this.compile(template, 'full', name);
        } else if(this._template_precompiled(template)) {
            this.compile(template, 'prerender', name);
		} else {
			throw new Error(`
			    setTemplate: an error occurred: ${JSON.stringify({ template, base })}
            `);
		}

		return this;
	}

    /**
     * _template_withNoVars
     * @param template {string}
     * @returns {boolean}
     */
    _template_withNoVars(template){
        return /String/.test(classof(template)) && !this._regex.test(template);
    }

    /**
     * _template_withVars
     * @param template {string}
     * @returns {boolean}
     */
    _template_withVars(template){
        return /String/.test(classof(template)) && this._regex.test(template);
    }

    /**
     * _template_precompiled
     * @param template {string}
     * @returns {boolean}
     */
    _template_precompiled(template){
        return /Object/.test(classof(template));
    }

    /**
     * compile
     * @param template {string|object}
     * @param type {string}
     * @param name {string}
     */
    compile(template, type, name){

        switch(type) {
            case 'basic': {
                this._compiled[name] = () => template;
                break;
            }
            case 'prerender': {
                this._compiled[name] = this._prerender(template);
                break;
            }
            case 'full': {
                this._compiled[name] = this._compile(template);
                break;
            }
        }
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
		return this;
	}

	/**
	 * setRegex
	 * @param regex {RegExp}
	 */
	setRegex(regex){

		this._regex = regex || this._regex;
		return this;
	}

	/**
	 * Set prrenderer
	 * @param {Any} renderer
	 */
	setPrerenderer(renderer) {

		this._prerender = renderer;
		return this;
	}

	/**
	 * Set precompiler
	 * @param {Any} precompiler
	 */
	setPrecompiler(precompile) {

		this._precompile = precompile;
		return this;
	}

	/**
	 * setElementCreater
	 * @param {function} func
	 */
	setElementCreater(func) {

		this._createElement = func;
		return this;
	}

	/**
	 * Render view
	 * @param  {object} passedVars
	 * @param  {string} templateName
	 * @param  {boolean} force
	 * @param  {boolean} renderedFlag
	 * @return {this}
	 */
	render(passedVars = {}, { templateName = 'base', force = false, renderedFlag = true } = {}){

		// merge passed passedViewVars into localViewVars
		let tmpLocalViewVars = Object.assign({}, this._vars, passedVars);

		// do nothing if already rendered
		if(this.getAttribute(this._rootNode, 'rendered') && !force){
			this.trigger('view-already-rendered');
			return this;
		}

		if(force){
			this._emptyNode(this._rootNode);
		}

		// keep rendered template
		this.renderedTemplate = this._render(templateName, tmpLocalViewVars);
		// write template into dom
		this._templateNode.innerHTML = this.renderedTemplate;

		// if exists slot in "templateNode" then move rootNodes to there
		let slotNode = this._getSlotNode(this._templateNode);
		if(slotNode) {
			this._moveSlotNodeToRootNode(slotNode, this._rootNode);
		}

		// append templateNode to _rootNode
		this.appendChildNodesTo(this._templateNode, this._rootNode);

		// el is alias for _rootNode
		this.el = this._rootNode;

		// set rendered flag
		if(renderedFlag){
			this.setAttribute(this._rootNode, 'rendered', renderedFlag);
			this.trigger('view-rendered');
		}

		return this;
	}

	/**
	 * _render
	 * @param templateName {string}
	 * @param tmpLocalViewVars {object}
	 */
	_render(templateName, tmpLocalViewVars){
		return this._compiled[templateName](tmpLocalViewVars);
	}

	/**
	 * _getSlotNode
	 * @param node {Element}
	 * @returns {Element}
	 */
	_getSlotNode(node){
		return node.querySelector(this._slot);
	}

	/**
	 * _moveSlotNodeToRootNode
	 * @param slotNode {Element}
	 * @param rootNode {Element}
	 */
	_moveSlotNodeToRootNode(slotNode, rootNode){
		this.appendChildNodesTo(rootNode, slotNode);
	}

	/**
	 *_emptyNode
	 * @param node {Element}
	 */
	_emptyNode(node){
		node.innerHTML = '';
	}

	/**
	 * _compile
	 * @param  {String} template
	 * @return {Function}
	 */
	_compile(template){

		let precompiledString = this._precompile(template);
		let precompiledObject = (new Function('return ' + precompiledString)());
		let prerenderedFunction = this._prerender(precompiledObject);

		return prerenderedFunction;
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
	 * @param {HTMLElement} domNode
	 * @param {string} name
	 * @param {boolean} value
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
