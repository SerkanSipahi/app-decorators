import { Stylesheet } from 'src/libs/stylesheet';
import sinon from 'sinon';

// init special innerHTML for test
String.prototype.removeGutter = function(){
    return this.replace(/[\t\n\r]/gm, '');
};

describe('Class Stylesheet ', () => {

    describe('initialize', () => {

        let element = null;
        let defaultOptions = null;

        beforeEach(() => {
            element = document.createElement('div');
            defaultOptions = {
                appendTo: element,
                styles: '. foo { color: blue}',
            };
        });

        it('should throw error required properties missing', () => {

            let options1 = { appendTo: element };
            let options2 = { styles: element };
            let options3 = { appendTo: element, styles: '' };
            let options4 = { appendTo: true, styles: '. foo { color: blue}' };

            (() => new Stylesheet() ).should.throw('Required: appendTo and styles');
            (() => new Stylesheet(options1) ).should.throw('Required: appendTo and styles');
            (() => new Stylesheet(options2) ).should.throw('Required: appendTo and styles');
            (() => new Stylesheet(options3) ).should.throw('Required: appendTo and styles');
            (() => new Stylesheet(options4) ).should.throw('Passed appendTo element should be instance of HTMLElement');

        });

        it('wenn kein appendTo, dann als default in <head> ', () => {
            // in head kann nur angehängt werden wenn mindestens DOMContenLoaded state
            // erreicht ist, weil dann <head> element gezogen werden kann. Und
            // dann prüfen was in onAttach on steht
        });

        it('should not throw when passed arguments correct', () => {

            let options1 = {
                appendTo: element,
                styles: '. foo { color: blue}',
            };

            (() => new Stylesheet(options1) ).should.not.throw();
        });

        it('should add correct element to instance._scope during the creation', () => {

            // setup
            let stylesheet = null;
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

    describe('_insertStylesheet' ,() => {

        it('logic inside of _insertStylesheet', () => {


        });

    });

    describe('_createStylesheet' ,() => {

        it('logic inside of _createStylesheet', () => {


        });

    });

    describe('_runProcess' ,() => {

        it('logic inside of _runProcess', () => {


        });

    });

    describe('on' ,() => {

        it('logic inside of on', () => {


        });

    });

    describe('logic inside of _run method', () => {

        let stylesheet = null;
        let element = null;
        let defaultOptions = null;

        let getOptions = options => Object.assign({}, defaultOptions, options);
        let stub = (method, value) => sinon.stub(Stylesheet.prototype, method, _ => value);

        let expectedResult =
        '<div id="appendToElement">'+
            '<style type="text/css">'+
                '.foo { color: blue }'+
            '</style>'+
        '</div>';


        beforeEach(() => {

            element = document.createElement('div');
            element.id = "appendToElement";
            defaultOptions = {
                appendTo: element,
                styles: '.foo { color: blue }',
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
                    '<style type="text/css">'+
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