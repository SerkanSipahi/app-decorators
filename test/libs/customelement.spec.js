
import CustomElement from 'src/libs/customelement';

describe('Class CustomElement', () => {

	describe('method convertToValidComponentName', () => {

		it('should add a component prefix by default', () => {
			CustomElement.convertToValidComponentName('foo').should.be.equal('com-foo');
		});
		
		it('should add a component by passed prefix', () => {
			CustomElement.convertToValidComponentName('foo', 'x').should.be.equal('x-foo');
		});

	});

	describe('method extractPrototype', () => {

		class Blue {
			foo() {}
			bar() {}
			baz() {}
		}

		let extractedPrototype = CustomElement.extractPrototype(Blue);

		it('should return excepted methods by given Class', () => {
			extractedPrototype.should.have.property('foo');
			extractedPrototype.should.have.property('bar');
			extractedPrototype.should.have.property('baz');
			extractedPrototype.should.not.have.ownProperty('constructor');
		});

	});

	describe('method register passed class Red', () => {

		class Red {
			foo() {}
			bar() {}
			baz() {}
		}

		CustomElement.register(Red);

		it('should return instanceof HTMLElement', () => {
			let red = Red.instance();
			red.should.be.instanceOf(HTMLElement);
		});

	});

	describe('method register passed class Green', () => {

		class Green {
			foo() {}
			bar() {}
			baz() {}
		}

		CustomElement.register(Green, HTMLFormElement);

		it('should return instanceof HTMLFormElement', () => {
			let green = Green.instance();
			green.should.be.instanceOf(HTMLFormElement);
		});

	});

});
