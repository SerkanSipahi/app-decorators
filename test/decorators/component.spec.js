
import { component } from 'src/app-decorators';

describe('@component decorator', () => {

	@component()
	class Foo {}

	it('should instance of HTMLElement', () => {
		let foo = Foo.create();
		foo.should.be.instanceOf(HTMLElement);
		foo.outerHTML.should.equal('<com-foo></com-foo>');
	});

	// *********************** //

	@component({
		extends: 'img'
	})
	class Bar {}

	it('should instance of HTMLImageElement', () => {
		let bar = Bar.create();
		bar.should.be.instanceOf(HTMLImageElement);
		bar.outerHTML.should.equal('<img is="com-bar">');
	});

	// *********************** //

	@component({
		name: 'my-bier'
	})
	class Baz {}

	it('should instance of HTMLElement + custom componentname', () => {
		let baz = Baz.create();
		baz.should.be.instanceOf(HTMLElement);
		baz.outerHTML.should.equal('<my-bier></my-bier>');
	});

	// *********************** //

	@component({
		name: 'my-qux',
		extends: 'form',
	})
	class Qux {}

	it('should instance of HTMLFormElement + custom componentname', () => {
		let qux = Qux.create();
		qux.should.be.instanceOf(HTMLFormElement);
		qux.outerHTML.should.equal('<form is="my-qux"></form>');
	});

});
