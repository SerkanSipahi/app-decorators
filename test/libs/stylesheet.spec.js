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

    describe('_getEventName' ,() => {

        it('determine eventname by passed on string', () => {

            let stylesheet = new Stylesheet(defaultOptions);

            stylesheet._getEventName('load').should.be.equal("load");
            stylesheet._getEventName('click .foo').should.be.equal("click");
            stylesheet._getEventName('click click').should.be.equal("click");
            stylesheet._getEventName('startpage /a/b/c.html').should.be.equal("startpage");
            stylesheet._getEventName('/a/b/c.html /a/b/c.html').should.be.equal("/a/b/c.html");
            stylesheet._getEventName('only-screen-(max-width:-500px) only screen (max-width: 500px)').should.be.equal("only-screen-(max-width:-500px)");

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
            importSrc = "http://localhost:4000/styles/test-1.css";
            importSrc2 = "http://localhost:4000/styles/test-2.css";
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
                '<link rel="stylesheet" href="http://localhost:4000/styles/test-1.css" media="only x">' +
                '<figure>Foo</figure>' +
            '</div>');

            // when this not happend then onload event will not fired
            document.body.append(element);

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
                '<link rel="stylesheet" href="http://localhost:4000/styles/test-1.css" media="only x">' +
                '<link rel="stylesheet" href="http://localhost:4000/styles/test-2.css" media="only x">' +
                '<figure>Foo</figure>' +
            '</div>');

            // when this not happend then onload event will not fired
            document.body.append(element);

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
                '<link rel="stylesheet" href="http://localhost:4000/styles/test-1.css" media="only x">' +
                '<figure>Foo</figure>' +
            '</div>');

            // when this not happend then onload event will not fired
            document.body.append(element);

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

    describe('style and link order', () => {

        let element = null;
        let container = [];
        let styles = [
            {
                attachOn: 'load',
                type: 'on',
                imports: ["a.css", "b.css", "c.css"],
                styles: '.baz {color: green;}',
            },
            {
                attachOn: 'load',
                type: 'lala',
                imports: ["e.css", "f.css"],
                styles: '.laz {color: green;}',
            },
            {
                attachOn: 'immediately',
                type: 'default',
                imports: [],
                styles: '.foo {color: blue;}',
            },
            {
                attachOn: 'immediately',
                type: 'default',
                imports: [],
                styles:'.naz {color: yellow;}',
            },
            {
                attachOn: 'DOMContentLoaded',
                type: 'on',
                imports: ["d.css"],
                styles:'.bar {color: red;}',
            },
        ];

        beforeEach(() => element = document.createElement('div'));
        afterEach(() => {
            Stylesheet.prototype._supportRelPreload.restore();
            stylesheet && stylesheet.destroy ? stylesheet.destroy(): null;
            container.forEach(stylesheet => stylesheet.destroy());
        });

        it('should add style firstly then imports in array order', () => {

            sinon.stub(Stylesheet.prototype, '_supportRelPreload').callsFake(() => false);

            let options = Object.assign({}, defaultOptions, {
                appendTo: element,
                attachOn: 'foo',
                type: 'on',
                order: 0,
                imports: [
                    "a.css",
                    "b.css",
                    "c.css",
                ],
                styles:
                '.baz {' +
                    'color: green;' +
                '}',
            });
            stylesheet = new Stylesheet(options);
            element.dispatchEvent(new Event('foo'));

            element.outerHTML.should.be.equal(
            '<div>' +
                '<style class="style-order-0">.baz {color: green;}</style>' +
                '<link rel="stylesheet" href="a.css" media="only x" class="style-order-0">' +
                '<link rel="stylesheet" href="b.css" media="only x" class="style-order-0">' +
                '<link rel="stylesheet" href="c.css" media="only x" class="style-order-0">' +
            '</div>');
        });

        it('should create style element in order of pass array ', done => {

            sinon.stub(Stylesheet.prototype, '_supportRelPreload').callsFake(() => false);

            for(let i = 0, len = styles.length; i < len; i++){
                let style = styles[i];
                container.push(new Stylesheet(Object.assign({}, defaultOptions,{
                    appendTo: element,
                    attachOn: style.attachOn,
                    imports: style.imports,
                    styles: style.styles,
                    type: style.type,
                    order: i,
                })));
            }

            setTimeout(() => {
                element.outerHTML.should.be.equal(
                '<div>' +
                    '<style class="style-order-0">.baz {color: green;}</style>' +
                    '<link rel="stylesheet" href="a.css" media="only x" class="style-order-0">' +
                    '<link rel="stylesheet" href="b.css" media="only x" class="style-order-0">' +
                    '<link rel="stylesheet" href="c.css" media="only x" class="style-order-0">' +
                    '<style class="style-order-1">.laz {color: green;}</style>' +
                    '<link rel="stylesheet" href="e.css" media="only x" class="style-order-1">' +
                    '<link rel="stylesheet" href="f.css" media="only x" class="style-order-1">' +
                    '<style class="style-order-2">.foo {color: blue;}</style>' +
                    '<style class="style-order-3">.naz {color: yellow;}</style>' +
                    '<style class="style-order-4">.bar {color: red;}</style>' +
                    '<link rel="stylesheet" href="d.css" media="only x" class="style-order-4">' +
                '</div>');
                done();
            }, 500);

            element.dispatchEvent(new Event("lala"));

        });

        it('should create style element in order of pass array with inner <header> element', () => {

            sinon.stub(Stylesheet.prototype, '_supportRelPreload').callsFake(() => false);

            for(let i = 0, len = styles.length; i < len; i++){
                let style = styles[i];
                container.push(new Stylesheet(Object.assign({}, defaultOptions,{
                    appendTo: element,
                    attachOn: style.attachOn,
                    imports: style.imports,
                    styles: style.styles,
                    type: style.type,
                    order: i,
                })));
            }

            element.innerhTML = '<header>Hello World</header>';
            setTimeout(() => {
                element.outerHTML.should.be.equal(
                    '<div>' +
                    '<style class="style-order-0">.baz {color: green;}</style>' +
                    '<link rel="stylesheet" href="a.css" media="only x" class="style-order-0">' +
                    '<link rel="stylesheet" href="b.css" media="only x" class="style-order-0">' +
                    '<link rel="stylesheet" href="c.css" media="only x" class="style-order-0">' +
                    '<style class="style-order-1">.laz {color: green;}</style>' +
                    '<link rel="stylesheet" href="e.css" media="only x" class="style-order-1">' +
                    '<link rel="stylesheet" href="f.css" media="only x" class="style-order-1">' +
                    '<style class="style-order-2">.foo {color: blue;}</style>' +
                    '<style class="style-order-3">.naz {color: yellow;}</style>' +
                    '<style class="style-order-4">.bar {color: red;}</style>' +
                    '<link rel="stylesheet" href="d.css" media="only x" class="style-order-4">' +
                    '<header>Hello World</header>' +
                    '</div>');
                done();
            }, 1000);

            element.dispatchEvent(new Event("lala"));

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