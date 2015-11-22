
import { component } from 'src/app-decorators';

describe('@component', () => {

	@component()
	class FooComponent {}

	@component(HTMLImageElement)
	class BarComponent {}

	@component(HTMLFormElement)
	class BazComponent {}

	it('should instance of HTMLDivElement', () => {
		let fooComponent = new FooComponent();
		fooComponent.should.be.instanceOf(HTMLDivElement);
	});

	it('should instance of HTMLImageElement', () => {
		let barComponent = new BarComponent();
		barComponent.should.be.instanceOf(HTMLImageElement);
	});

	it('should instance of HTMLFormElement', () => {
		let bazComponent = new BazComponent();
		bazComponent.should.be.instanceOf(HTMLFormElement);
	});

});
