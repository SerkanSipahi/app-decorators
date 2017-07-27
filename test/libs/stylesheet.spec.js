import { Stylesheet } from '../../src/libs/stylesheet';
import { Eventhandler } from '../../src/libs/eventhandler';
import sinon from 'sinon';

// init special innerHTML for test
String.prototype.removeGutter = function(){
    return this.replace(/[\t\n\r]/gm, '');
};

describe('Class Stylesheet ', () => {

    let element = null;
    let defaultOptions = null;
    let stylesheet = null;

    beforeEach(() => {
        element = document.createElement('div');
        defaultOptions = {
            appendTo: element,
            styles: '.foo { color: blue}',
            eventFactory: scope => new Eventhandler({ element: scope }),
        };
    });

    afterEach(() => stylesheet ? stylesheet.destroy() : null);

    describe('initialize', () => {

        it('should throw error required properties missing', () => {

            let options1 = { appendTo: element };
            let options2 = { styles: element };
            let options3 = { appendTo: element, styles: '' };
            let options4 = { appendTo: true, styles: '.foo { color: blue}' };

            (() => new Stylesheet() ).should.throw('Required: appendTo and styles');
            (() => new Stylesheet(options1) ).should.throw('Required: appendTo and styles');
            (() => new Stylesheet(options2) ).should.throw('Required: appendTo and styles');
            (() => new Stylesheet(options3) ).should.throw('Required: appendTo and styles');
            (() => new Stylesheet(options4) ).should.throw('Passed appendTo element should be instance of HTMLElement');

        });

        it.skip('wenn kein appendTo, dann als default in <head> ', () => {
            // in head kann nur angehängt werden wenn mindestens DOMContenLoaded state
            // erreicht ist (domtree muss zur Verfügung stehen)
        });

        it('should not throw when passed arguments correct', () => {

            let options1 = {
                appendTo: element,
                styles: '.foo { color: blue}',
                eventFactory: scope => new Eventhandler({ element: scope }),
            };

            (() => new Stylesheet(options1) ).should.not.throw();
        });

        it('should add correct element to instance._scope during the creation', () => {

            // setup
            let options = null;

            // Test 1
            options = Object.assign({}, defaultOptions, { attachOn: 'DOMContentLoaded' });
            stylesheet = new Stylesheet(options);
            should(stylesheet._scope).be.instanceof(Window);

            // Test 2
            options = Object.assign({}, defaultOptions, { attachOn: 'load' });
            stylesheet = new Stylesheet(options);
            should(stylesheet._scope).be.instanceof(Window);

            // Test 2
            options = Object.assign({}, defaultOptions, { attachOn: 'some-custom-event' });
            stylesheet = new Stylesheet(options);
            should(stylesheet._scope).be.instanceof(HTMLElement);

        });

    });

    describe('_createStylesheetNode' ,() => {

        it('should create style element by given stylesheet', () => {

            let styleElement = null;
            stylesheet = new Stylesheet(defaultOptions);

            // Test 1
            styleElement = stylesheet._createStylesheetNode('.a { color: #faf }');
            styleElement.should.be.instanceof(HTMLStyleElement);
            styleElement.outerHTML.should.be.equal('<style>.a { color: #faf }</style>');

            // Test 2
            styleElement = stylesheet._createStylesheetNode();
            styleElement.should.be.instanceof(HTMLStyleElement);
            styleElement.outerHTML.should.be.equal('<style></style>');

        });

    });

    describe('_insertStylesheetNode' ,() => {

        it('should append stylesElement to an empty element (appendTo)', () => {

            stylesheet = new Stylesheet(defaultOptions);
            let styleElement = stylesheet._createStylesheetNode('.a { color: #bab }');
            // clear element
            stylesheet._appendTo.innerHTML = '';

            element = stylesheet._insertStylesheetNode(element, styleElement);
            element.outerHTML.should.be.equal('<div><style>.a { color: #bab }</style></div>');

        });

        it('should append stylesElement to an element (appendTo) with nodes', () => {

            stylesheet = new Stylesheet(defaultOptions);
            let styleElement = stylesheet._createStylesheetNode('.a { color: #bab }');
            // clear element
            stylesheet._appendTo.innerHTML = '<b>zZz</b>';

            element = stylesheet._insertStylesheetNode(element, styleElement);
            element.outerHTML.should.be.equal('<div><style>.a { color: #bab }</style><b>zZz</b></div>');

        });

    });

    describe('_runProcess' ,() => {

        it('logic inside of _runProcess', done => {

            // this test this._trigger inside of _runProcess
            element.addEventListener('attached-stylesheet', () => done());
            stylesheet = new Stylesheet(defaultOptions);
            // clear element
            stylesheet._appendTo.innerHTML = '';

            element = stylesheet._runProcess('.abc { color: #cac }');
            stylesheet._appendTo.outerHTML.should.be.equal('<div><style>.abc { color: #cac }</style></div>');

        });

    });

    describe('multiple events', () => {

        let element = null;

        beforeEach(() => {
            element = document.createElement('div');
            sinon.spy(Stylesheet.prototype, "_processListener");
        });

        afterEach(() => {
            Stylesheet.prototype._processListener.restore();
            stylesheet.destroy();
        });

        it('should trigger every event', () => {

            let options = Object.assign({}, defaultOptions, {
                appendTo: element,
                attachOn: 'foo',
                removeEvent: false,
            });
            stylesheet = new Stylesheet(options);

            element.dispatchEvent(new Event('foo'));
            element.dispatchEvent(new Event('foo'));
            element.dispatchEvent(new Event('foo'));

            stylesheet._processListener.callCount.should.be.equal(3);

        });

        it('should add style node only once', () => {

            // default of "removeEvent" is true
            let options = Object.assign({}, defaultOptions, {
                appendTo: element,
                attachOn: 'foo',
            });
            stylesheet = new Stylesheet(options);

            element.dispatchEvent(new Event('foo'));
            element.dispatchEvent(new Event('foo'));
            element.dispatchEvent(new Event('foo'));

            stylesheet._processListener.callCount.should.be.equal(1);

        });

    });

    describe('reinit', () => {

        it('should work when destroy and reinit again', () => {

            stylesheet = new Stylesheet(defaultOptions);
            should(stylesheet._refs.get(stylesheet)).be.instanceof(Map);

            stylesheet.destroy();

            should(stylesheet._refs.get(stylesheet)).be.not.ok();
            should(stylesheet._scope).be.not.ok();
            should(stylesheet._stylesElement).be.not.ok();
            should(stylesheet._appendTo).be.not.ok();

            stylesheet.reinit(element);
            should(stylesheet._scope).be.instanceof(Window);
            stylesheet._stylesElement.outerHTML.should.be.equal('<style>.foo { color: blue}</style>'),
            stylesheet._appendTo.outerHTML.should.be.equal('<div><style>.foo { color: blue}</style></div>');

        });

    });

    describe('logic inside of _run method', () => {

        // declarations
        let stylesheet = null;
        let element = null;
        let defaultOptions = null;
        let getOptions = options => Object.assign({}, defaultOptions, options);
        let stub = (method, value) => sinon.stub(Stylesheet.prototype, method).callsFake(_ => value);
        let expectedResult =
        '<div id="appendToElement">'+
            '<style>'+
                '.foo { color: blue }'+
            '</style>'+
        '</div>';


        beforeEach(() => {

            element = document.createElement('div');
            element.id = "appendToElement";
            defaultOptions = {
                appendTo: element,
                styles: '.foo { color: blue }',
                eventFactory: scope => new Eventhandler({ element: scope }),
            };

            sinon.spy(Stylesheet.prototype, "_isAlreadyDone");
            sinon.spy(Stylesheet.prototype, "_runProcess");
            sinon.spy(Stylesheet.prototype, "_processListener");
            sinon.spy(Stylesheet.prototype, "_addEventListener");

        });

        afterEach(() => {

            Stylesheet.prototype._getDocumentReadyState.restore();
            Stylesheet.prototype._isAlreadyDone.restore();
            Stylesheet.prototype._runProcess.restore();
            Stylesheet.prototype._processListener.restore();
            Stylesheet.prototype._addEventListener.restore();

            stylesheet.destroy();

        });

        /*************************************************************************
         * _cleanup is here tested! Remove for test cases removeListener in _cleanup
         * and see whats going on
         *************************************************************************/

        /**
         * "attachOn == immediately"
         */

        it('should work as expected when "readyState == loading" and "attachOn == immediately"', () => {

            stub("_getDocumentReadyState", 'loading');
            stylesheet = new Stylesheet(getOptions({ attachOn: 'immediately' }));
            stylesheet._isAlreadyDone.args[0][0].should.be.equal('immediately');
            stylesheet._isAlreadyDone.returnValues[0].should.be.equal(true);
            stylesheet._runProcess.callCount.should.be.equal(1);
            stylesheet._addEventListener.callCount.should.be.equal(0);
            stylesheet._processListener.callCount.should.be.equal(0);

        });

        /**
         *  readyState == loading for document.{ load, DOMContentLoaded }
         */

        it('should work as expected when "readyState == loading" and "attachOn == DOMContentLoaded"', () => {

            element.innerHTML = '<div class="bar">Hello World</div>';

            stub("_getDocumentReadyState", 'loading');
            stylesheet = new Stylesheet(getOptions({ attachOn: 'DOMContentLoaded' }));
            stylesheet._isAlreadyDone.args[0][0].should.be.equal('DOMContentLoaded');
            stylesheet._isAlreadyDone.returnValues[0].should.be.equal(false);
            stylesheet._runProcess.callCount.should.be.equal(0);
            stylesheet._addEventListener.callCount.should.be.equal(1);
            stylesheet._processListener.callCount.should.be.equal(0);

            // simulate DOMContentLoaded event
            window.dispatchEvent(new Event('DOMContentLoaded'));

            stylesheet._processListener.callCount.should.be.equal(1);
            stylesheet._runProcess.callCount.should.be.equal(1);

            stylesheet._appendTo.outerHTML.should.be.equal(
                '<div id="appendToElement">'+
                    '<style>'+
                        '.foo { color: blue }'+
                    '</style>'+
                    '<div class="bar">Hello World</div>'+
                '</div>'
            );

        });

        it('should work as expected when "readyState == loading" and "attachOn == load"', () => {

            stub("_getDocumentReadyState", 'loading');
            stylesheet = new Stylesheet(getOptions({ attachOn: 'load' }));
            stylesheet._isAlreadyDone.args[0][0].should.be.equal('load');
            stylesheet._isAlreadyDone.returnValues[0].should.be.equal(false);
            stylesheet._runProcess.callCount.should.be.equal(0);
            stylesheet._addEventListener.callCount.should.be.equal(1);
            stylesheet._processListener.callCount.should.be.equal(0);

            // simulate load event
            window.dispatchEvent(new Event('load'));

            stylesheet._processListener.callCount.should.be.equal(1);
            stylesheet._runProcess.callCount.should.be.equal(1);

            stylesheet._appendTo.outerHTML.should.be.equal(expectedResult);

        });

        /**
         *  readyState == interactive for document.{ load, DOMContentLoaded }
         */

        it('should work as expected when "readyState == interactive" and "attachOn == DOMContentLoaded"', () => {

            stub("_getDocumentReadyState", 'interactive');
            stylesheet = new Stylesheet(getOptions({ attachOn: 'DOMContentLoaded' }));
            stylesheet._isAlreadyDone.args[0][0].should.be.equal('DOMContentLoaded');
            stylesheet._isAlreadyDone.returnValues[0].should.be.equal(true);
            stylesheet._runProcess.callCount.should.be.equal(1);
            stylesheet._addEventListener.callCount.should.be.equal(0);
            stylesheet._processListener.callCount.should.be.equal(0);

            stylesheet._appendTo.outerHTML.should.be.equal(expectedResult);

        });

        it('should work as expected when "readyState == interactive" and "attachOn == load"', () => {

            stub("_getDocumentReadyState", 'interactive');
            stylesheet = new Stylesheet(getOptions({ attachOn: 'load' }));
            stylesheet._isAlreadyDone.args[0][0].should.be.equal('load');
            stylesheet._isAlreadyDone.returnValues[0].should.be.equal(false);
            stylesheet._runProcess.callCount.should.be.equal(0);
            stylesheet._addEventListener.callCount.should.be.equal(1);
            stylesheet._processListener.callCount.should.be.equal(0);

            // simulate load event
            window.dispatchEvent(new Event('load'));

            stylesheet._processListener.callCount.should.be.equal(1);
            stylesheet._runProcess.callCount.should.be.equal(1);

            stylesheet._appendTo.outerHTML.should.be.equal(expectedResult);

        });

        /**
         *  readyState == complete for document.{ load, DOMContentLoaded }
         */

        it('should work as expected when "readyState == complete" and "attachOn == DOMContentLoaded"', () => {

            stub("_getDocumentReadyState", 'complete');
            stylesheet = new Stylesheet(getOptions({ attachOn: 'DOMContentLoaded' }));
            stylesheet._isAlreadyDone.args[0][0].should.be.equal('DOMContentLoaded');
            stylesheet._isAlreadyDone.returnValues[0].should.be.equal(true);
            stylesheet._runProcess.callCount.should.be.equal(1);
            stylesheet._addEventListener.callCount.should.be.equal(0);
            stylesheet._processListener.callCount.should.be.equal(0);

            stylesheet._appendTo.outerHTML.should.be.equal(expectedResult);

        });

        it('should work as expected when "readyState == complete" and "attachOn == load"', () => {

            stub("_getDocumentReadyState", 'complete');
            stylesheet = new Stylesheet(getOptions({ attachOn: 'load' }));
            stylesheet._isAlreadyDone.args[0][0].should.be.equal('load');
            stylesheet._isAlreadyDone.returnValues[0].should.be.equal(true);
            stylesheet._runProcess.callCount.should.be.equal(1);
            stylesheet._addEventListener.callCount.should.be.equal(0);
            stylesheet._processListener.callCount.should.be.equal(0);

            stylesheet._appendTo.outerHTML.should.be.equal(expectedResult);

        });


        it('should work as expected when trigger load event', () => {

            stub("_getDocumentReadyState", 'loading');
            stylesheet = new Stylesheet(getOptions({ attachOn: 'load' }));
            stylesheet._isAlreadyDone.args[0][0].should.be.equal('load');
            stylesheet._isAlreadyDone.returnValues[0].should.be.equal(false);
            stylesheet._addEventListener.callCount.should.be.equal(1);
            stylesheet._processListener.callCount.should.be.equal(0);
            stylesheet._runProcess.callCount.should.be.equal(0);

            window.dispatchEvent(new Event('load'));

            stylesheet._processListener.callCount.should.be.equal(1);
            stylesheet._runProcess.callCount.should.be.equal(1);

            stylesheet._appendTo.outerHTML.should.be.equal(expectedResult);

        });

    });

});