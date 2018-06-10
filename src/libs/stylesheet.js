class Stylesheet {

    /**
     * @Ideas:
     * - implement "containment: strict" for avoiding repaint, recalc, etc
     */

    constructor(config = {}) {
        this.init(config);
    }

    /**
     * @type {WeakMap}
     */
    _refs = {
        appendTo: null,
        stylesElement: null,
        scope: null,
    };

    /**
     * e.g. (created, attached, DOMContentLoaded, load)
     * @type {string}
     * @private
     */
    _attachOn = 'load';

    /**
     * @type {string}
     * @private
     */
    _styles = '';

    /**
     * @type {Array}
     * @private
     */
    _imports = [];

    /**
     * @type {string}
     * @private
     */
    _type = 'on';


    /**
     * will remove event after node appended
     * @type {boolean}
     * @private
     */
    _removeEvent = true;

    /**
     * _eventFactory
     * @type {object}
     * @private
     */
    _eventFactory = function(scope){};

    /**
     * @private
     */
    _onLoadImports = null;

    /**
     * @type {undefined}
     * @private
     */
    _order = undefined;

    /**
     * @type {boolean}
     * @private
     */
    _fallback = false;

    /**
     * @type {boolean}
     * @private
     */
    _attached = false;

    /**
     * @type {string}
     * @private
     */
    _event = 'attached';

    /**
     * @type {Array}
     * @private
     */
    _eventStatePattern = [/DOMContentLoaded|load/, 'on'];

    /**
     * @type {{DOMContentLoaded: string, load: string}}
     * @private
     */
    _stateSettings = {
        DOMContentLoaded: 'interactive',
        load: 'complete',
    };

    /**
     * Holds the value of whether the registered event (attachOn) is reached or not.
     * @type {boolean}
     */
    alreadyDone = false;

    /**
     * _appendTo {Element}
     */
    set _appendTo(appendTo) {
        this._refs.get(this).set('appendTo', appendTo);
    };
    get _appendTo() {
        let _result = this._refs.get(this);
        return _result && this._refs.get(this).get('appendTo');
    };

    /**
     * _stylesElement {String|Function}
     */

    set _stylesElement(stylesElement) {
        this._refs.get(this).set('stylesElement', stylesElement);
    };
    get _stylesElement() {
        let _result = this._refs.get(this);
        return _result && this._refs.get(this).get('stylesElement');
    };

    /**
     * _scope {Element}
     */
    set _scope(element) {
        this._refs.get(this).set('scope', element);
    };
    get _scope() {
        let _result = this._refs.get(this);
        return _result && this._refs.get(this).get('scope');
    };

    /**
     * _eventListener {}
     */
    set _eventListener(listener) {
        this._refs.get(this).set('eventListener', listener);
    };
    get _eventListener() {
        let _result = this._refs.get(this);
        return _result && this._refs.get(this).get('eventListener');
    };

    /**
     * @param appendTo {Element}
     * @param styles {string}
     * @param attachOn {string}
     * @param imports {Array}
     * @param type {string}
     * @param eventFactory {Function}
     * @param removeEvent {Boolean}
     * @param onLoadImports {Function}
     * @param order {number}
     * @param alreadyDone {Boolean}
     * @param fallback {Boolean}
     */
    init({
        appendTo,
        styles,
        attachOn,
        imports,
        type,
        eventFactory,
        removeEvent,
        onLoadImports,
        order,
        alreadyDone,
        fallback} = {}){

        if(!appendTo){
            throw new Error('Required: appendTo');
        }

        if(!styles && !imports){
            throw new Error('Required: styles or imports');
        }

        this.alreadyDone = alreadyDone;

        this._checkElement(appendTo);
        this._initRefs();

        // init props
        this._attachOn      = attachOn || this._attachOn;
        this._appendTo      = appendTo;
        this._styles        = styles;
        this._imports       = imports  || [];
        this._type          = type     || this._type;
        this._eventFactory  = eventFactory;
        this._onLoadImports = onLoadImports || this._onLoadImports;
        this._removeEvent   = typeof removeEvent === 'boolean' ? removeEvent : this._removeEvent;
        this._fallback      = typeof fallback === 'boolean' ? fallback : this._fallback;
        this._order         = order >= 0 ? order : this._order;

        this._initScope();
        this._eventListener = this._eventFactory(this._scope);

        this._run(styles, imports);
    }

    /**
     * alias for init
     * @param options {object}
     */
    reinit(element){

        this._checkElement(element);
        this._initRefs();
        this._appendTo = element;
        this._initScope();
        this._eventListener = this._eventFactory(this._scope);

        this._run(this._styles, this._imports);
    }

    /**
     * @returns {boolean}
     */
    initialized(){
        return this._refs.has(this);
    }

    /**
     * @return {Undefined}
     */
    destroy() {

        if(!this._refs.has(this)){
            return null;
        }

        this._cleanup();
        this._refs.delete(this);
    }

    /**
     * removes eventListener
     */
    cleanup(){
        this._cleanup();
    }

    /**
     * @param element {HTMLElement}
     * @private
     */
    _checkElement(element){

        if(!(element instanceof HTMLElement)) {
            throw new Error('Passed appendTo element should be instance of HTMLElement');
        }
    }

    /**
     * @param styles {string}
     * @param imports {Array}
     * @private
     */
    _run(styles, imports){

        if(this._isAlreadyDone(this._attachOn)){
            this._runProcess(styles, imports);
            return;
        }

        // listen event
        this._addEventListener(this._attachOn, styles, imports);
    }

    /**
     * @param value
     * @returns {*}
     * @private
     */
    _getEventName(value = ""){

        let collection = value.split(' ');
        return collection[0];
    }

    /**
     * @param attachOn {string}
     * @param styles {string}
     * @param imports {Array}
     * @private
     */
    _addEventListener(attachOn, styles, imports) {

        this._eventListener.on(attachOn, () => {
            this._processListener(styles, imports);
            this.alreadyDone = true;
            // event reached
            // Remove listener after stylesheet is appended.
            // We dont want multiple style elements on multiple events
            let event = this._getEventName(attachOn);
            this._removeEvent && this._eventListener.off(event);
        });
    }

    /**
     *
     * @returns {boolean}
     * @private
     */
    _isAlreadyDone(state){

        // when the an event e.g. click, foo, bar is already fulfilled.
        if(this.alreadyDone){
            return this.alreadyDone;
        }

        // fire immediately no matter what status is reached
        if(this._attachOn === 'immediately') {
            return this.alreadyDone = true;
        }

        // fire when load (complete) event already reached but we declared as DOMContentLoaded
        if(this._getDocumentReadyState() === 'complete' && state === 'DOMContentLoaded') {
            return this.alreadyDone = true;
        }

        return (
            this.alreadyDone = this._getDocumentReadyState() === this._stateSettings[state]
        );
    }

    /**
     * @private
     */
    _initScope(){

        let [attachOn, type] = this._eventStatePattern;
        if(attachOn.test(this._attachOn) && type === this._type){
            this._scope = window;
        } else {
            this._scope = this._appendTo;
        }
    }

    /**
     * @returns {string}
     * @private
     */
    _getDocumentReadyState(){
        return document.readyState;
    }

    /**
     * @param styles {string}
     * @param imports {Array}
     * @returns {HTMLElement} element
     * @private
     */
    _runProcess(styles, imports = []){

        let element = null;
        if(styles) {
            this._stylesElement = this._createStylesheetNode(styles);
            element = this._insertStylesheetNode(this._appendTo, this._stylesElement);
        }

        for(let href of imports){
            if(this._supportRelPreload()){
                this._stylesElement = this._createLinkRelPreloadNode(href);
            } else {
                this._stylesElement = this._createLinkRelStylesheetNode(href);
            }
            element = this._insertStylesheetNode(this._appendTo, this._stylesElement);
        }

        this._trigger(this._event);

        return element;
    }

    /**
     * @param styles {string}
     * @param imports {Array}
     * @private
     */
    _processListener(styles, imports){
        this._runProcess(styles, imports);
    }

    /**
     * @private
     */
    _cleanup(){

        if(!this._processListener){
            return;
        }

        this._eventListener.off(this._attachOn);

        // remove rendered styles and link
        let elements = this._appendTo.querySelectorAll('link,style');
        for(let element of (elements.length && elements || [])){
            element.parentElement.removeChild(element);
        }
    }

    /**
     * _insertStylesheetNode
     * @param appendTo {HTMLElement}
     * @param stylesElement {Element}
     * @returns appendTo {HTMLElement}
     * @private
     */
    _insertStylesheetNode(appendTo, stylesElement) {

        this._addOrderClass(this._order);

        let [node] = [];
        let styleQuery = `.style-order-${this._order}`;
        let styleOrderNodes = appendTo.querySelectorAll(styleQuery);

        if(this._order >=0 && styleOrderNodes.length) {
            node = this._lastItem(styleOrderNodes);
        } else {
            node = this._lastItem(appendTo.children);
        }

        if(node){
            if(/style|link/.test(node.localName.toLowerCase())){
                node.after(stylesElement);
            } else {
                node.before(stylesElement);
            }
            return appendTo;
        }

        appendTo.appendChild(stylesElement);
        return appendTo;
    }

    /**
     * _createStylesheetNode
     * @param styles {string}
     * @returns element {Element}
     * @private
     */
    _createStylesheetNode(styles = ''){

        let element = document.createElement('style');

        // Support for IE
        if (element.styleSheet){
            element.styleSheet.cssText = this._styles;
        }
        // Support for the rest
        else {
            element.appendChild(document.createTextNode(styles));
        }

        return element;
    }

    /**
     *
     * @param href {string}
     * @returns {Element}
     * @private
     */
    _createLinkRelPreloadNode(href){

        let element = this._createElement('div');
        element.innerHTML =
        '<link rel="preload" ' +
            'as="style" ' +
            'href="'+href+'" ' +
            'onload="' +
            'this.rel=\'stylesheet\';' +
            'this.__event = new CustomEvent(\'load:stylesheet\', { bubbles: true });' +
            'this.dispatchEvent(this.__event)"' +
        '>';

        return element.querySelector('link');
    }

    /**
     *
     * @param href
     * @param attachOn
     * @returns {Element}
     * @private
     */
    _createLinkRelStylesheetNode(href, attachOn = 'all'){

        let self        = this;
        let linkElement = this._createElement('link');
        let event       = new CustomEvent('load:stylesheet', { bubbles: true, detail: this });

        linkElement.rel    = 'stylesheet';
        linkElement.href   = href;
        // temporarily set media to something inapplicable to ensure it'll fetch without blocking render
        // see: https://github.com/filamentgroup/loadCSS/blob/master/src/loadCSS.js#L25
        linkElement.media  = "only x";
        linkElement.onload = function(){
            let self2 = this;
            if(!self._onLoadImports) {
                self2.media=`${attachOn}`;
                linkElement.dispatchEvent(event);
                return;
            }
            self._onLoadImports(
                function call(done){
                    self2.media=`${attachOn}`;
                    done ? done() : null;
                    linkElement.dispatchEvent(event);
                }, self2
            )
        };

        return linkElement;
    }

    /**
     * @private
     */
    _initRefs(){

        this._refs = new WeakMap([
            [this, new Map([
                ['appendTo', null],
                ['scope', null],
                ['eventListener', null],
            ])],
        ]);
    }

    /**
     * @param  {String} eventName
     * @return {Undefined}
     */
    _trigger(eventName){

        this._attached = true;

        let event = new CustomEvent(eventName, {
            bubbles: true,
            detail: {
                type: 'stylesheet',
            },
        });
        this._appendTo.dispatchEvent(event);
    }

    /**
     * @param type {string}
     * @returns {Element}
     * @private
     */
    _createElement(type){
        return document.createElement(type);
    }

    /**
     * @param items {NodeList|HTMLElement[]}
     * @private
     */
    _lastItem(items){
        return items[items.length-1];
    }

    /**
     * @param order {number}
     * @private
     */
    _addOrderClass(order = undefined){
        if(order >=0){
            this._stylesElement.classList.add(`style-order-${order}`);
        }
    }

    /**
     * @returns {boolean}
     */
    supportRelPreload(){
        return this._supportRelPreload();
    }

    /**
     * @returns {boolean}
     * @private
     */
    _supportRelPreload(){

        if(this._fallback){
            return false;
        }

        let hasPreload = false;
        try {
            hasPreload = window.document.createElement( "link" ).relList.supports( "preload" );
        } catch (e) {
            hasPreload = false;
        }

        return hasPreload;
    }
}

export {
    Stylesheet
}