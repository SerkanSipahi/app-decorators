
import { elements } from 'src/configs/elements';
import { CustomElement } from 'src/libs/customelement';
import sinon from 'sinon';

describe('Class CustomElement', () => {

	describe('method getClassName', () => {

		class Child {
			a() {}
			b() {}
			c() {}
			static d(){}
			static e(){}
			static f(){}
		}

		it('should return classname', () => {
			CustomElement.getClassName(Child).should.be.equal('Child');
		});

	});

	describe('method convertToValidComponentName', () => {

		it('should add a component prefix by default', () => {
			CustomElement.convertToValidComponentName('foo').should.be.equal('com-foo');
		});

		it('should add a component by passed prefix', () => {
			CustomElement.convertToValidComponentName('foo', 'x').should.be.equal('x-foo');
		});

	});

	describe('method register passing more than one argument', () => {

		class Morethan extends HTMLElement {}
		CustomElement.register(Morethan);

		it('should throw an error', () => {
			(function(){ Morethan.create({}, 1) })
				.should.throw('Its not allowd to pass more than one argument');
		});

	});

	describe('method register passing none object', () => {

		class Noneobject extends HTMLElement {}
		CustomElement.register(Noneobject);

		it('should throw an error', () => {
			(function(){ Noneobject.create([]) })
				.should.throw('Passed Object must be an object or undefined');
		});

	});

	describe('method register passed class Red', () => {

		class Red extends HTMLElement {
			foo() {}
			bar() {}
			baz() {}
		}

		CustomElement.register(Red);

		it('should return by default instanceof HTMLElement if no second argument passed', () => {
			let red = Red.create();
			red.should.be.instanceOf(HTMLElement);
		});

	});

	describe('method register passed class Green and as second parameter HTMLFormElement', () => {

		class Green extends HTMLFormElement {

			created(){
				this.$value = 1234;
			}
			foo() {
				return this.bar();
			}
			bar() {
				return this.baz();
			}
			baz() {
				return this.$value;
			}
			// move to "babel-plugin-app-decorators-component"
			static get extends() {
				return 'form';
			}
		}

		CustomElement.register(Green);

		it('should return instanceof HTMLFormElement', () => {

			let green = Green.create();
			green.should.be.instanceOf(HTMLFormElement);
			green.outerHTML.should.equal('<form is="com-green"></form>');
		});

		it('should called foo bar baz', () => {

			let green = Green.create();

			// setup tests (spying)
			sinon.spy(green, "foo");
			sinon.spy(green, "bar");
			sinon.spy(green, "baz");

			// start tests
			green.foo().should.be.equal(1234);
			green.foo.calledOnce.should.be.true();
			green.bar.calledOnce.should.be.true();
			green.baz.calledOnce.should.be.true();

			// cleanup (tearDown)
			green.foo.restore();
			green.bar.restore();
			green.baz.restore();

		});

		it('should call foo, bar and baz if customelement created by dom', (done) => {

			let spy_green_foo = sinon.spy(Green.prototype, "foo");
			let spy_green_bar = sinon.spy(Green.prototype, "bar");
			let spy_green_baz = sinon.spy(Green.prototype, "baz");

			let div = document.createElement('div');
			div.id = 'customelement-green';
			document.body.appendChild(div);
			div.innerHTML = '<form is="com-green"></form>';

			setTimeout(() => {

				// start tests
				document.querySelector('form[is="com-green"]').foo().should.be.equal(1234);
				spy_green_foo.calledOnce.should.be.true();
				spy_green_bar.calledOnce.should.be.true();
				spy_green_baz.calledOnce.should.be.true();

				// cleanup (tearDown)
				spy_green_foo.restore();
				spy_green_bar.restore();
				spy_green_baz.restore();

				done();

			}, 20);

		});
	});
});
