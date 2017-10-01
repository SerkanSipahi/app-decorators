import elementToFunction from '../../src/libs/element-to-function';

describe('elementToFunction', () => {

    it('should return same class when its an Function', () => {

        elementToFunction(HTMLElement).should.have.property('prototype');
        elementToFunction(HTMLElement).should.be.Function();
        elementToFunction(HTMLElement).should.be.equal(HTMLElement);

    });

    it('should make object to Function with prototype', () => {

        let elementObject = {};
        elementToFunction(elementObject).should.have.property('prototype');
        elementToFunction(elementObject).should.be.Function();

    });

});