import { elements } from 'src/configs/elements';
import { bootstrapPolyfills } from 'src/bootstrap';
import { delay } from 'src/helpers/delay';

import sinon from 'sinon';

describe('Register', async () => {

	await bootstrapPolyfills;
	let { Register } = await System.import('src/libs/customelement');

	describe('_getClassName method', () => {

		it('should return given class name', () => {

			class Foo {}
			Register._getClassName(Foo).should.be.equal('Foo');

		});

	});

	describe('_createComponentName method', () => {

		it('should create component name by given name and prefix', () => {

			Register._createComponentName('Foo', 'com').should.be.equal('com-foo');
			Register._createComponentName('Bar').should.be.equal('com-bar');

		});

	});

	describe('_addExtends method', () => {

		it('should add extends prop by _config', () => {

			class Foo {}
			Foo = Register._addExtends(Foo, { extends: 'img' });

			Foo.should.have.propertyByPath('extends').equal('img');

		});

		it('should not add extends if not exists', () => {

			class Foo {}
			Foo = Register._addExtends(Foo);

			Foo.should.not.have.propertyByPath('extends');

		});

	});

	describe('_registerElement method', () => {

		it('should add create factory by given Class', () => {

			class MyLang extends HTMLDivElement {}
			MyLang = Register._registerElement(MyLang, 'rust-lang');

			MyLang.should.have.propertyByPath('create');

		});

		it('should create instanceof HTMLElement', () => {

			class MyLang extends HTMLDivElement {
				createdCallback({ text }){
					this.innerHTML = text;
				}
			}
			MyLang = Register._registerElement(MyLang, 'go-lang');

			MyLang.create({ text: 'Hello World' }).should.be.instanceOf(HTMLElement);
			MyLang.create({ text: 'Hello World' }).outerHTML.should.be.equal('<go-lang>Hello World</go-lang>');

		});

		it('should create instanceof HTMLImageElement', () => {

			class MyLang extends HTMLImageElement {
				createdCallback({ src }){
					this.src = src;
				}
				static get extends(){
					return 'img';
				}
			}
			MyLang = Register._registerElement(MyLang, 'go-image');

			MyLang.create({}).should.be.instanceOf(HTMLImageElement);
			MyLang.create({ src: 'golang.png' }).src.should.match(/golang\.png/);

		});

		it('should not throw error not arguments passed', () => {

			class MyLang extends HTMLDivElement {}
			MyLang = Register._registerElement(MyLang, 'c-lang');

			(() => { MyLang.create(); }).should.not.throw();

		});

		it('should throw error when more than one argument added', () => {

			class MyLang extends HTMLDivElement {}
			MyLang = Register._registerElement(MyLang, 'java-lang');

			(() => { MyLang.create({ text: 'Hello World' }, 'just-arg'); }).should.throw();

		});

		it('should throw error when not object or undefined passed as argument', () => {

			class MyLang extends HTMLDivElement {}
			MyLang = Register._registerElement(MyLang, 'ruby-lang');

			(() => { MyLang.create('hello world'); }).should.throw();
			(() => { MyLang.create(true); }).should.throw();
			(() => { MyLang.create(1234); }).should.throw();

		});

	});

	describe('customElement method (integration test)', () => {

		it('should create instance of image element', () => {

			class MyImage extends HTMLImageElement {
				createdCallback({ src }){
					this.src = src;
				}
			}

			Register.customElement(MyImage, {
				extends: 'img',
				name: 'coding-image',
			});

			let myImageElement = MyImage.create({ src: 'golang.png' });

			myImageElement.should.be.instanceOf(HTMLImageElement);
			myImageElement.src.should.match(/golang\.png/);

		});

		it('should call foo bar baz if created', () => {

			class MyLang extends HTMLDivElement {
				createdCallback({ value }){
					this.$value = value;
				}
				foo() {
					return this.bar();
				}
				bar() {
					return this.$value;
				}
			}

			Register.customElement(MyLang, {
				name: 'python-lang',
			});
			let myLang = MyLang.create({ value: 1234 });

			// setup tests (spying)
			sinon.spy(myLang, "foo");
			sinon.spy(myLang, "bar");

			// start tests
			myLang.foo().should.be.equal(1234);
			myLang.foo.calledOnce.should.be.true();
			myLang.bar.calledOnce.should.be.true();

			// cleanup (tearDown)
			myLang.foo.restore();
			myLang.bar.restore();

		});

		it('should call foo bar baz if created by dom it self', async () => {

			class MyLang extends HTMLFormElement {
				createdCallback(){
					this.$value = 1234;
				}
				foo() {
					return this.bar();
				}
				bar() {
					return this.$value;
				}
			}

			Register.customElement(MyLang, {
				name: 'coffee-lang',
				extends: 'form'
			});

			let spy_myLang_foo = sinon.spy(MyLang.prototype, "foo");
			let spy_myLang_bar = sinon.spy(MyLang.prototype, "bar");

			let div = document.createElement('div');
			div.id = 'customelement-coffee';
			document.body.appendChild(div);
			div.innerHTML = '<form is="coffee-lang"></form>';

			await delay(10);

			// start tests
			document.querySelector('[is="coffee-lang"]').foo().should.be.equal(1234);
			spy_myLang_foo.calledOnce.should.be.true();
			spy_myLang_bar.calledOnce.should.be.true();

			// cleanup (tearDown)
			spy_myLang_foo.restore();
			spy_myLang_bar.restore();

		});
	});

});