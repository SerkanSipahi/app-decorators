
import { component } from 'src/app-decorators';

describe('@component decorator', () => {


	@component()
	class Foo {}

	@component(HTMLImageElement)
	class Bar {}

	@component(HTMLFormElement)
	class Baz {}

	it('should instance of HTMLElement', () => {
		let foo = Foo.instance();
		foo.should.be.instanceOf(HTMLElement);
	});

	it('should instance of HTMLImageElement', () => {
		let bar = Bar.instance();
		bar.should.be.instanceOf(HTMLImageElement);
	});

	it('should instance of HTMLFormElement', () => {
		let baz = Baz.instance();
		baz.should.be.instanceOf(HTMLFormElement);
	});

});
