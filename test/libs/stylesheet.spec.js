import { Stylesheet } from 'src/libs/stylesheet';

describe('Class Stylesheet ', () => {

    it('should throw error required properties missing', () => {

        let element = document.createElement('div');

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

});