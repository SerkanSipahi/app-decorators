import $ from 'jquery';
import { bootstrapPolyfills } from 'src/bootstrap';

describe('@component', async () => {

	await bootstrapPolyfills;
	let { component, getComponentName } = await System.import('src/decorators/component');

	describe('getComponentName', () => {

		it('should return name', () => {

			let element1 = document.createElement('com-foo');
			element1::getComponentName().should.be.equal('com-foo');

			let element2 = document.createElement('img');
			element2.setAttribute('is', 'my-image');
			element2::getComponentName().should.be.equal('img[is="my-image"]');

		});

	});

	describe('decorator', () => {

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
		class Bar {
			created() {
				this.src = 'path/to/picture.png';
			}
		}

		it('should instance of HTMLImageElement', () => {
			let bar = Bar.create();
			bar.should.be.instanceOf(HTMLImageElement);

			try {
				bar.outerHTML.should.equal('<img src="path/to/picture.png" is="com-bar">');
			} catch(e){
				bar.outerHTML.should.equal('<img is="com-bar" src="path/to/picture.png">');
			}
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
		class Qux {
			created(){
				this.innerHTML = 'Hello World!';
			}
		}

		it('should instance of HTMLFormElement + custom componentname', () => {
			let qux = Qux.create();
			qux.should.be.instanceOf(HTMLFormElement);
			qux.outerHTML.should.equal('<form is="my-qux">Hello World!</form>');
		});

		it('should create a element by passed @component config (name, extends) from out of dom', (done) => {

			$('body').append('<form is="my-qux"></form>');

			// setTimeout is required for browsers that use the customelement polyfill (onyl for test)
			setTimeout(() => {
				// test
				$('form[is="my-qux"]').get(0).outerHTML.should.equal('<form is="my-qux">Hello World!</form>');
				//cleanup
				$('form[is="my-qux"]').remove();
				done();
			}, 0);

		});
	});

});
