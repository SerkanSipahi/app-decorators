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
     * @type {RegExp}
     * @private
     */
    _eventStateRege = /DOMContentLoaded|load/;

    /**
     * @type {{DOMContentLoaded: string, load: string}}
     * @private
     */
    _stateSettings = {
        DOMContentLoaded: 'interactive',
        load: 'complete',
    };

    /**
     * @type {function}
     * @private
     */
    _listenerWrapper = () => {};

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
     * @param appendTo {Element}
     * @param styles {string}
     * @param attachOn {string}
     */
    init({ appendTo, styles, attachOn } = {}){

        if(!appendTo || !styles){
            throw new Error('Required: appendTo and styles');
        }

        this._checkElement(appendTo);
        this._initRefs();

        // init props
        this._attachOn = attachOn || this._attachOn;
        this._appendTo = appendTo;
        this._styles   = styles;

        this._initScope();
        this._run(styles);
    }

    /**
     * promise based eventhandler
     * @param event {string}
     * @returns {Promise}
     */
    on(event) {

        let promise = null;

        if(this._attached){
            promise = Promise.resolve(this._stylesElement);
        } else {

            let promiseHandler = resolve => {
                let onListener = e => {
                    e.stopPropagation();
                    resolve(this._stylesElement);
                    this._scope.removeEventListener(event, onListener, false);
                };
                this._scope.addEventListener(event, onListener, false);
            };

            promise = new Promise(promiseHandler);
        }
        return promise;
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
        if(this._isAlreadyDone(this._attachOn)){
            this._runProcess(styles);
            return;
        }

        /**
         * listen for readyState
         */

        // wrapper for removeListener
        this._listenerWrapper = _ => {
            this._processListener(styles);
        };
        // listen event
        this._addEventListener(this._scope, this._attachOn,
            this._listenerWrapper,
        false);
    }

    /**
     * @param element {HTMLElement}
     * @param event {string}
     * @param callback {function}
     * @param useCapture {boolean}
     * @private
     */
    _addEventListener(element, event, callback, useCapture) {

        element.addEventListener(event, callback, useCapture);
    }

    /**
     * @returns {boolean}
     * @private
     */
    _isAlreadyDone(state){

        if(this._attachOn === 'immediately') {
            return true;
        }

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

        if(this._eventStateRege.test(this._attachOn)){
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

        this._stylesElement = this._createStylesheet(styles);
        let element = this._insertStylesheet(this._appendTo, this._stylesElement);

        this._trigger(this._event);
        this._cleanup();

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

        this._scope.removeEventListener(
            this._attachOn, this._listenerWrapper, false
        );
    }

    /**
     *
     * @param appendTo {HTMLElement}
     * @param stylesElement {Element}
     * @returns appendTo {HTMLElement}
     * @private
     */
    _insertStylesheet(appendTo, stylesElement) {

        let [ node ] = appendTo.children;
        if(node){
            appendTo.insertBefore(stylesElement, node);
        } else {
            appendTo.appendChild(stylesElement);
        }

        return appendTo;
    }

    /**
     * _createStylesheet
     * @param styles {string}
     * @returns element {Element}
     * @private
     */
    _createStylesheet(styles = ''){

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
                ['stylesElement', null],
                ['scope', null],
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