
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
		bar.outerHTML.should.equal('<img is="com-bar"></img>');
	});

	// *********************** //

	@component({
		name: 'my-bier'
	})
	class Baz {}

	it('should instance of HTMLFormElement + custom prefix for @component', () => {
		let baz = Baz.create();
		baz.should.be.instanceOf(HTMLElement);
		baz.outerHTML.should.equal('<my-bier></my-bier>');
	});

});
