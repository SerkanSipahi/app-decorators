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
    _event = 'attached';

    /**
     * @type {RegExp}
     * @private
     */
    _eventStateRege = /DOMContentLoaded|load/;

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
     * _stylesheetElement {String|Function}
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

        this._initRefs({ appendTo, styles });

        this._attachOn = attachOn || this._attachOn;
        this._appendTo = appendTo;

        if(this._isAlreadyDone(this._attachOn)){
            this._runProcess(styles);
            return;
        }

        if(this._eventStateRege.test(this._attachOn)){
            this._scope = window;
        } else {
            this._scope = this._appendTo;
        }

        this._runProcessListener = () => {
            this._runProcess(styles)
        };

        this._scope.addEventListener(
            this._attachOn,
            this._runProcessListener,
            false
        );
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
            promise = new Promise(resolve =>
                this._scope.addEventListener(event, _ =>
                    resolve(this._stylesElement)
                , false)
            );
        }
        return promise;
    }

    /**
     * alias for init
     * @param options {object}
     */
    reinit(options){
        this.init(options);
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

    }

    /**
     * @returns {boolean}
     * @private
     */
    _isAlreadyDone(state){

        return (
            document.readyState == this._stateSettings[state]
        );
    }

    /**
     * @param styles
     * @private
     */
    _runProcess(styles){

        this._stylesElement = this._createStylesheet(styles);
        this._insertStylesheet(this._stylesElement);
        this._trigger(this._event);

        this._cleanup();
    }

    /**
     * @private
     */
    _cleanup(){

        if(!this._runProcessListener){
            return;
        }

        this._scope.removeEventListener(
            this._attachOn,
            this._runProcessListener
        );
    }

    /**
     * stylesElement {Element}
     * @private
     */
    _insertStylesheet(stylesElement) {

        let [ node ] = this._appendTo.children;
        if(node){
            this._appendTo.insertBefore(stylesElement, node);
        } else {
            this._appendTo.appendChild(stylesElement);
        }
    }

    /**
     * @param styles {string}
     * @returns element {Element}
     * @private
     */
    _createStylesheet(styles){

        let element = document.createElement('style');
        element.type = 'text/css';

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
     * @param appendTo {Element}
     * @param styles {string}
     * @private
     */
    _initRefs({ appendTo, styles } = {}){

        // init refs
        if(!appendTo || !styles){
            throw new Error('Required: appendTo and styles');
        }

        if(!(appendTo instanceof HTMLElement)) {
            throw new Error('Passed appendTo element should be instance of HTMLElement');
        }

        this._refs = new WeakMap([
            [this, new Map([
                ['appendTo', null],
                ['stylesheetElement', null],
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
        this._element.dispatchEvent(event);

    }
}

export {
    Stylesheet
}