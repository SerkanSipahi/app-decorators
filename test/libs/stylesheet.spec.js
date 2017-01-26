import { Stylesheet } from 'src/libs/stylesheet';
import sinon from 'sinon';

describe('Class Stylesheet ', () => {

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

    describe('logic inside of _run method', () => {

        let stylesheet = null;
        let element = document.createElement('div');
        let defaultOptions = {
            appendTo: element,
            styles: '. foo { color: blue}',
        };
        let getOptions = options => Object.assign({}, defaultOptions, options);
        let stub = (method, value) => sinon.stub(Stylesheet.prototype, method, _ => value);

        beforeEach(() => {

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

        });

        /**
         *  readyState == loading for document.{ load, DOMContentLoaded }
         */

        it('should work as expected when "readyState == loading" and "attachOn == DOMContentLoaded"', () => {

            stub("_getDocumentReadyState", 'loading');
            stylesheet = new Stylesheet(getOptions({ attachOn: 'DOMContentLoaded' }));
            stylesheet._isAlreadyDone.args[0][0].should.be.equal('DOMContentLoaded');
            stylesheet._isAlreadyDone.returnValues[0].should.be.equal(false);
            stylesheet._runProcess.callCount.should.be.equal(0);
            stylesheet._addEventListener.callCount.should.be.equal(1);

        });

        it('should work as expected when "readyState == loading" and "attachOn == load"', () => {

            stub("_getDocumentReadyState", 'loading');
            stylesheet = new Stylesheet(getOptions({ attachOn: 'load' }));
            stylesheet._isAlreadyDone.args[0][0].should.be.equal('load');
            stylesheet._isAlreadyDone.returnValues[0].should.be.equal(false);
            stylesheet._runProcess.callCount.should.be.equal(0);
            stylesheet._addEventListener.callCount.should.be.equal(1);

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

        });

        it('should work as expected when "readyState == interactive" and "attachOn == load"', () => {

            stub("_getDocumentReadyState", 'interactive');
            stylesheet = new Stylesheet(getOptions({ attachOn: 'load' }));
            stylesheet._isAlreadyDone.args[0][0].should.be.equal('load');
            stylesheet._isAlreadyDone.returnValues[0].should.be.equal(false);
            stylesheet._runProcess.callCount.should.be.equal(0);
            stylesheet._addEventListener.callCount.should.be.equal(1);

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

        });

        it('should work as expected when "readyState == complete" and "attachOn == load"', () => {

            stub("_getDocumentReadyState", 'complete');
            stylesheet = new Stylesheet(getOptions({ attachOn: 'load' }));
            stylesheet._isAlreadyDone.args[0][0].should.be.equal('load');
            stylesheet._isAlreadyDone.returnValues[0].should.be.equal(true);
            stylesheet._runProcess.callCount.should.be.equal(1);
            stylesheet._addEventListener.callCount.should.be.equal(0);

        });

    });

});