
import { component } from 'src/app-decorators';

describe('@component', () => {

	@component(HTMLElement)
	class FooComponent {

	}

	it('should instance of HTMLElement', () => {
		let fooComponent = new FooComponent();
		fooComponent.should.be.instanceOf(HTMLElement);
	});

});
