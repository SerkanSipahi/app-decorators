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

        (() => { new Stylesheet() }).should.throw('Required: appendTo and styles');
        (() => { new Stylesheet(options1) }).should.throw('Required: appendTo and styles');
        (() => { new Stylesheet(options2) }).should.throw('Required: appendTo and styles');
        (() => { new Stylesheet(options3) }).should.throw('Required: appendTo and styles');
        (() => { new Stylesheet(options4) }).should.throw('Passed appendTo element should be instance of HTMLElement');

    });

    it('should not throw when passed arguments correct', () => {

        let options1 = {
            appendTo: element,
            styles: '. foo { color: blue}',
        };

        new Stylesheet(options1);
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

    it.skip('', () => {

        sinon.stub(Stylesheet.prototype, "_getDocumentReadyState", _ => 'pending' );
        Stylesheet.prototype._getDocumentReadyState.restore();
    });

});