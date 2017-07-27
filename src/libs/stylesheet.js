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
     * @type {boolean}
     * @private
     */
    _attached = false;

    /**
     * @type {string}
     * @private
     */
    _event = 'attached-stylesheet';

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
     */
    init({ appendTo, styles, attachOn, imports, type, eventFactory, removeEvent } = {}){

        if(!appendTo || !styles){
            throw new Error('Required: appendTo and styles');
        }

        this._checkElement(appendTo);
        this._initRefs();

        // init props
        this._attachOn     = attachOn || this._attachOn;
        this._appendTo     = appendTo;
        this._styles       = styles;
        this._imports      = imports;
        this._type         = type || this._type;
        this._eventFactory = eventFactory;
        this._removeEvent  = typeof removeEvent === 'boolean' ? removeEvent : this._removeEvent;

        this._initScope();
        this._eventListener = this._eventFactory(this._scope);

        this._run(styles);
    }

    /**
     * alias for init
     * @param options {object}
     */
    reinit(element){

        this._checkElement(element);
        this._initRefs();
        this._appendTo = element;
        this._stylesElement = element.querySelector('style');
        this._initScope();
        this._eventListener = this._eventFactory(this._scope);

        this._addEventListener(this._attachOn, this._styles);
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
     * @private
     */
    _run(styles){

        // run process if readyState already reached
        // FIMXE: attachOn == load|DOMContentLoaded and type == on

        //let [attachOn, type] = this._eventStatePattern;
        //if(attachOn.test(this._attachOn) && type === this._type){
        // TODO: was tun wenn action (also route erreicht ist)
        // TODO: was tun wenn mediaMatch (erreicht)

        // @TODO: funktion auflösen
        if(this._isAlreadyDone(this._attachOn)){
            this._runProcess(styles);
            return;
        }

        // attachOn == preload and type == 'rel'
        else if(true){

        }

        // https://developer.mozilla.org/de/docs/Web/API/Window/matchMedia
        // mit radius, also z.B. +-30
        // attachOn == '(max-width: 360px' and type == 'mediaMatch)' && type == 'mediaMatch'
        else if(true){

        }

        // kann raus weil es auch injected wird(wird also vom _addEventListener behandelt)
        // attachOn != this._eventStatePattern[0](dom|DOMContentLoaded) && type == 'on'
        else if(true){

        }

        // kann raus weil es auch injected wird(wird also vom _addEventListener behandelt)
        // attachOn == '/this/{{value}}/path.html' && type == 'action'
        else if(true){

        }

        // listen event
        this._addEventListener(this._attachOn, styles);
    }

    /**
     * @param attachOn {string}
     * @param styles {string}
     * @private
     */
    _addEventListener(attachOn, styles) {

        this._eventListener.on(attachOn, () => {
            this._processListener(styles);
            // Remove listener after stylesheet is appended.
            // We dont want multiple style elements on multiple events
            this._removeEvent ? this._eventListener.off(this._attachOn) : null;
        });
    }

    /**
     * @returns {boolean}
     * @private
     */
    _isAlreadyDone(state){

        // fire immediately no matter what status is reached
        if(this._attachOn === 'immediately') {
            return true;
        }

        // fire when load (complete) event already reached but we declared as DOMContentLoaded
        if(this._getDocumentReadyState() === 'complete' && state === 'DOMContentLoaded') {
            return true;
        }

        return (
            this._getDocumentReadyState() === this._stateSettings[state]
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
     * @returns {HTMLElement} element
     * @private
     */
    _runProcess(styles){

        this._stylesElement = this._createStylesheetNode(styles);
        let element = this._insertStylesheetNode(this._appendTo, this._stylesElement);

        this._trigger(this._event);

        return element;
    }

    /**
     * @param styles {string}
     * @private
     */
    _processListener(styles){
        this._runProcess(styles);
    }

    /**
     * @private
     */
    _cleanup(){

        if(!this._processListener){
            return;
        }

        this._eventListener.off(this._attachOn);
    }

    /**
     * _insertStylesheetNode
     * @param appendTo {HTMLElement}
     * @param stylesElement {Element}
     * @returns appendTo {HTMLElement}
     * @private
     */
    _insertStylesheetNode(appendTo, stylesElement) {

        let [ node ] = appendTo.children;
        if(node){
            if(node.localName.toLocaleLowerCase() === 'style'){
                // insert after
                appendTo.insertBefore(stylesElement, node.nextSibling);
            } else {
                appendTo.insertBefore(stylesElement, node);
            }
        } else {
            appendTo.appendChild(stylesElement);
        }

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
        });
        this._appendTo.dispatchEvent(event);

    }
}

export {
    Stylesheet
}