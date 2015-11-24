
import { component } from 'src/app-decorators';

describe('@component', () => {

	@component()
	class FooComponent {}

	@component(HTMLImageElement)
	class BarComponent {}

	@component(HTMLFormElement)
	class BazComponent {}

	it('should instance of HTMLElement', () => {
		let fooComponent = FooComponent.instance();
		fooComponent.should.be.instanceOf(HTMLElement);
	});

	it('should instance of HTMLImageElement', () => {
		let barComponent = BarComponent.instance();
		barComponent.should.be.instanceOf(HTMLImageElement);
	});

	it('should instance of HTMLFormElement', () => {
		let bazComponent = BazComponent.instance();
		bazComponent.should.be.instanceOf(HTMLFormElement);
	});

});
