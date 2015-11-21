
import { component } from 'src/app-decorators';

describe('@component', () => {

	@component(HTMLElement)
	class FooComponent {}

	@component(HTMLFormElement)
	class BarComponent {}

	it('should instance of HTMLElement', () => {
		let fooComponent = new FooComponent();
		fooComponent.should.be.instanceOf(HTMLElement);
	});

	it('should instance of HTMLFormElement', () => {
		let barComponent = new BarComponent();
		barComponent.should.be.instanceOf(HTMLFormElement);
	});

	it('should throw an exeption', () => {
		(function(){
			@component()
			class BazComponent {}
		}).should.throw('Passed argument is undefined');;
	});

});
