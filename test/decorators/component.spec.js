
import { component } from 'src/app-decorators';

describe('@component decorator', () => {

	@component()
	class Foo {}

	@component(HTMLImageElement)
	class Bar {}

	@component(HTMLFormElement, 'x')
	class Baz {}

	it('should instance of HTMLElement', () => {
		let foo = Foo.create();
		foo.should.be.instanceOf(HTMLElement);
	});

	it('should instance of HTMLImageElement', () => {
		let bar = Bar.create();
		bar.should.be.instanceOf(HTMLImageElement);
	});

	it('should instance of HTMLFormElement + custom prefix for @component', () => {
		let baz = Baz.create();
		baz.should.be.instanceOf(HTMLFormElement);
		baz.outerHTML.should.equal('<x-baz></x-baz>');
	});

});
