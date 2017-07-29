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
            let options2 = { appendTo: true, styles: '.foo { color: blue}' };

            (() => new Stylesheet()).should.throw('Required: appendTo');
            (() => new Stylesheet(options1)).should.throw('Required: styles or imports');
            (() => new Stylesheet(options2)).should.throw('Passed appendTo element should be instance of HTMLElement');

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
            element.addEventListener('attached', () => done());
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
                type: 'on',
            });
            stylesheet = new Stylesheet(options);

            element.dispatchEvent(new Event('foo'));
            element.dispatchEvent(new Event('foo'));
            element.dispatchEvent(new Event('foo'));

            stylesheet._processListener.callCount.should.be.equal(3);
            stylesheet._appendTo.outerHTML.should.be.equal(
            '<div>' +
                '<style>.foo { color: blue}</style>' +
                '<style>.foo { color: blue}</style>' +
                '<style>.foo { color: blue}</style>' +
            '</div>');

        });

        it('should add style node only once', () => {

            // default of "removeEvent" is true
            let options = Object.assign({}, defaultOptions, {
                appendTo: element,
                attachOn: 'foo',
                type: 'on',
            });
            stylesheet = new Stylesheet(options);

            element.dispatchEvent(new Event('foo'));
            element.dispatchEvent(new Event('foo'));
            element.dispatchEvent(new Event('foo'));

            stylesheet._processListener.callCount.should.be.equal(1);
            stylesheet._appendTo.outerHTML.should.be.equal(
            '<div>' +
                '<style>.foo { color: blue}</style>' +
            '</div>');

        });

    });

    describe('async load css from external sources', () => {

        let element = null;
        let importSrc = null;
        let importSrc2 = null;

        beforeEach(() => {
            element = document.createElement('div');
            element.innerHTML = '<figure>Foo</figure>';
            importSrc = "https://cdnjs.cloudflare.com/ajax/libs/normalize/7.0.0/normalize.min.css";
            importSrc2 = "https://cdnjs.cloudflare.com/ajax/libs/sanitize.css/2.0.0/sanitize.min.css";
            sinon.spy(Stylesheet.prototype, "_runProcess");
        });

        afterEach(() => {
            Stylesheet.prototype._runProcess.restore();
            Stylesheet.prototype._supportRelPreload.restore();
            stylesheet.destroy();
        });

        it('should load css by link rel="preload"', () => {

            // fake _supportRelPreload for forcing link rel="preload"
            sinon.stub(Stylesheet.prototype, '_supportRelPreload').callsFake(() => true);

            let options = Object.assign({}, defaultOptions, {
                styles: "",
                appendTo: element,
                attachOn: 'immediately',
                type: 'default',
                imports: [ importSrc ],
            });
            stylesheet = new Stylesheet(options);

            stylesheet._runProcess.callCount.should.be.equal(1);
            // we need this hack because, when we force "preload" on devices that doesnt
            // support it, it remove as attr. So we have to append it afterwards.
            stylesheet._appendTo.querySelector('link').setAttribute('as', "style");

            let linkElement = stylesheet._appendTo.querySelector('link');
            linkElement.getAttribute('rel').should.be.equal("preload");
            linkElement.getAttribute('href').should.be.equal(importSrc);
            linkElement.getAttribute('as').should.be.equal("style");

            // when this not happend then onload event will not fired
            document.body.append(stylesheet._appendTo);

        });

        it('should load css by link rel="stylesheet" with async media attr hack', done => {

            // fake _supportRelPreload for forcing link rel="stylesheet"
            sinon.stub(Stylesheet.prototype, '_supportRelPreload').callsFake(() => false);

            let options = Object.assign({}, defaultOptions, {
                styles: "",
                appendTo: element,
                attachOn: 'bar',
                type: 'on',
                imports: [ importSrc ],
                // works only with link[rel="stylesheet"]
                onLoadImports: (mustCall, node) => {
                    mustCall(done);
                    // after loaded
                    node.getAttribute("media").should.be.equal("all");
                },
            });
            stylesheet = new Stylesheet(options);
            element.dispatchEvent(new Event('bar'));

            stylesheet._runProcess.callCount.should.be.equal(1);
            stylesheet._appendTo.outerHTML.should.be.equal(
            '<div>' +
                // see for media="only x" hack => https://github.com/filamentgroup/loadCSS/blob/master/src/loadCSS.js#L25
                '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/normalize/7.0.0/normalize.min.css" media="only x">' +
                '<figure>Foo</figure>' +
            '</div>');

            // when this not happend then onload event will not fired
            document.body.append(stylesheet._appendTo);

        });

        it('should load multiple imports by rel="stylesheet"', () => {

            // fake _supportRelPreload for forcing link rel="stylesheet"
            sinon.stub(Stylesheet.prototype, '_supportRelPreload').callsFake(() => false);

            let options = Object.assign({}, defaultOptions, {
                styles: "",
                appendTo: element,
                attachOn: 'click figure',
                type: 'on',
                imports: [ importSrc, importSrc2 ],
            });
            stylesheet = new Stylesheet(options);
            element.querySelector("figure").click();

            stylesheet._runProcess.callCount.should.be.equal(1);
            stylesheet._appendTo.outerHTML.should.be.equal(
            '<div>' +
                '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/normalize/7.0.0/normalize.min.css" media="only x">' +
                '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/sanitize.css/2.0.0/sanitize.min.css" media="only x">' +
                '<figure>Foo</figure>' +
            '</div>');

            // when this not happend then onload event will not fired
            document.body.append(stylesheet._appendTo);

        });

        it('should reinit load css by link rel="stylesheet" with async media attr hack when it destroyed', done => {

            // fake _supportRelPreload for forcing link rel="stylesheet"
            sinon.stub(Stylesheet.prototype, '_supportRelPreload').callsFake(() => false);

            let options = Object.assign({}, defaultOptions, {
                styles: "",
                appendTo: element,
                attachOn: 'bar',
                type: 'on',
                imports: [ importSrc ],
                // works only with link[rel="stylesheet"]
                onLoadImports: (mustCall, node) => {
                    mustCall(done);
                    // after loaded
                    node.getAttribute("media").should.be.equal("all");
                },
            });
            stylesheet = new Stylesheet(options);

            stylesheet.destroy();
            element.dispatchEvent(new Event('bar'));
            stylesheet._runProcess.callCount.should.be.equal(0);

            stylesheet.reinit(element);
            element.dispatchEvent(new Event('bar'));
            stylesheet._runProcess.callCount.should.be.equal(1);

            stylesheet._appendTo.outerHTML.should.be.equal(
            '<div>' +
                // see for media="only x" hack => https://github.com/filamentgroup/loadCSS/blob/master/src/loadCSS.js#L25
                '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/normalize/7.0.0/normalize.min.css" media="only x">' +
                '<figure>Foo</figure>' +
            '</div>');

            // when this not happend then onload event will not fired
            document.body.append(stylesheet._appendTo);

        });

    });

    describe('click event', () => {

        let element = null;

        beforeEach(() => {
            element = document.createElement('div');
            element.innerHTML = '<div class="foo">Foo</div>';
            sinon.spy(Stylesheet.prototype, "_processListener");
        });

        afterEach(() => {
            Stylesheet.prototype._processListener.restore();
            stylesheet.destroy();
        });

        it('should trigger on click', () => {

            let options = Object.assign({}, defaultOptions, {
                appendTo: element,
                attachOn: 'click .foo',
                type: 'on',
            });
            stylesheet = new Stylesheet(options);
            element.querySelector('.foo').click();

            stylesheet._processListener.callCount.should.be.equal(1);
            stylesheet._appendTo.outerHTML.should.be.equal(
            '<div>' +
                '<style>.foo { color: blue}</style>' +
                '<div class="foo">Foo</div>' +
            '</div>');
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