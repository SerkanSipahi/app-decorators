export const VARS = 'VARS';
export const NO_VARS = 'NO_VARS';
export const PRE_COMPILED = 'PRE_COMPILED';

let classof = value => {
	return Object.prototype.toString.call(value).slice(8, -1);
};

class View {

	/**
	 * constructor
	 * @param options {object}
	 */
	constructor(options = {}){

		this._templateNode = options.templateNode;
		this._regex = options.regex || this._regex;
		this._vars = options.vars || {};

		this.init(options);
	}


	/**
	 * _rootNode
	 * @type {WeakMap}
	 */
	_refs = null;

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
	 * initialized
	 * @returns {boolean}
	 */
	initialized(){

		return this._refs.has(this);

	}

	/**
	 * reinit (alias for init)
	 * @param args
	 */
	reinit(...args){
		this.init(...args);
	}

	/**
	 * init
	 * it will init core references
	 * @param rootNode {HTMLElement}
	 * @param prerenderer {function}
	 * @param precompiler {function}
	 * @param template {string|object}
	 */
	init({ rootNode, prerenderer, precompiler, template }){

		// init refs
		if(!rootNode){
			throw new Error(`
				rootNode is required! prerenderer are precompiler optional!
			`);
		}

		this._refs = new WeakMap([
			[this, new Map([
				['_rootNode',   rootNode],
				['_precompile', precompiler],
				['_prerender',  prerenderer],
			])],
		]);

		// init template
		template ? this.setTemplate(template) : null;
	}

	/**
	 * delete
	 * it will delete references
	 */
	delete(){

		this._refs.delete(this);

	}

	/**
	 * el (shortform for _rootNode.get(this))
	 * @type {Element}
	 */
	get el() {
		return this._refs.get(this).get('_rootNode');
	};

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
	 * Define template
	 * @param {string|object} template
	 * @param {string} name
	 */
	setTemplate(template = null, name = 'base'){

		if(this._getTemplateType(template) === NO_VARS){
			this.compile(NO_VARS, template, name);
		} else if(this._getTemplateType(template) === VARS){
			this.compile(VARS, template,  name);
		} else if(this._getTemplateType(template) === PRE_COMPILED) {
			this.compile(PRE_COMPILED, template,  name);
		} else {
			throw new Error(`
				setTemplate: an error occurred: ${JSON.stringify({ template, base })}
			`);
		}

		return this;
	}

	/**
	 * _getTemplateType
	 * @param template {string|object}
	 * @returns {string|null}
	 */
	_getTemplateType(template){

		if(/String/.test(classof(template)) && !this._regex.test(template)){
			return NO_VARS;
		} else if(/String/.test(classof(template)) && this._regex.test(template)){
			return VARS;
		} else if(/Object/.test(classof(template))){
			return PRE_COMPILED;
		} else {
			return null;
		}
	}

    /**
     * compile
	 * @param name {string}
     * @param template {string|object}
     * @param type {string}
	 * @returns {function}
     */
    compile(type = 'VARS', template, name = 'base'){

        switch(type) {
            case NO_VARS: {
                this._compiled[name] = () => template;
                break;
            }
			case VARS: {
				this._compiled[name] = this._compile(template);
				break;
			}
            case PRE_COMPILED: {
                this._compiled[name] = this._prerender(template);
                break;
            }
        }

		return this._compiled[name];
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
		let _tmpLocalViewVars = Object.assign({}, this._vars, passedVars);
		let _rootNode = this._refs.get(this).get('_rootNode');

		// do nothing if already rendered
		if(this.getAttribute(_rootNode, 'rendered') && !force){
			this.trigger('view-already-rendered');
			return this;
		}

		if(force){
			this._emptyNode(_rootNode);
		}

		// keep rendered template
		this.renderedTemplate = this._render(templateName, _tmpLocalViewVars);
		// write template into dom
		this._templateNode.innerHTML = this.renderedTemplate;

		// if exists slot in "templateNode" then move rootNodes to there
		let slotNode = this._getSlotNode(this._templateNode);
		if(slotNode) {
			this._moveRootNodesToSlotNode(_rootNode, slotNode);
		}

		// append templateNode to _rootNode
		this.appendChildNodesTo(this._templateNode, _rootNode);

		// set rendered flag
		if(renderedFlag){
			this.setAttribute(_rootNode, 'rendered', renderedFlag);
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
	 * _moveRootNodesToSlotNode
	 * @param rootNode {Element}
	 * @param slotNode {Element}
	 */
	_moveRootNodesToSlotNode(rootNode, slotNode){
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

		let precompiled = this._precompile(template);
		let prerendered = this._prerender(precompiled);

		return prerendered;
	}

	_precompile(template){

		let precompiledString = this._refs.get(this).get('_precompile')(template);
		let precompiledObject = (new Function('return ' + precompiledString)());

		return precompiledObject;
	}

	_prerender(precompiled){
		return this._refs.get(this).get('_prerender')(precompiled);
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
		return this._refs.get(this).get('_rootNode');
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
	 * @todo: should be injected
	 * @param  {String} event
	 * @return {Undefined}
	 */
	trigger(type){

		let event = new Event(type);
		let _rootNode = this._refs.get(this).get('_rootNode');

		_rootNode.dispatchEvent(event);
	}

}

export {
	View
};
