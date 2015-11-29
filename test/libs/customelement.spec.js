
import CustomElement from 'src/libs/customelement';

describe('Class CustomElement', () => {

	describe('method resolveClassInComponents passed class Child', () => {

		class Child {
			a() {}
			b() {}
			c() {}
			static d(){}
			static e(){}
			static f(){}
		}

		let [ className,
			  constructor,
			  proto,
			  instanceMethods,
		      staticMethods ] = CustomElement.resolveClassInComponents(Child);

		it('should return child as constructor name', () => {
			className.should.be.equal('Child');
		});

		it('should return child constructor typeof function', () => {
			constructor.toString().should.match(/function Child/);
		});

		it('should have properties of Child', () => {
			// method a
			instanceMethods[0].key.should.equal('a');
			instanceMethods[0].value.toString().should.match(/function a/);
			// method b
			instanceMethods[1].key.should.equal('b');
			instanceMethods[1].value.toString().should.match(/function b/);
			// method c
			instanceMethods[2].key.should.equal('c');
			instanceMethods[2].value.toString().should.match(/function c/);
		});

		it('should have static properties of Child', () => {
			// method d
			staticMethods[0].key.should.equal('d');
			staticMethods[0].value.toString().should.match(/function d/);
			// method e
			staticMethods[1].key.should.equal('e');
			staticMethods[1].value.toString().should.match(/function e/);
			// method f
			staticMethods[2].key.should.equal('f');
			staticMethods[2].value.toString().should.match(/function f/);
		});

	});

	describe('method resolveClassInComponents passed Child Class but has not Parent Class', () => {

		class Child {}

		let [ className,
			  constructor,
			  proto,
			  instanceMethods,] = CustomElement.resolveClassInComponents(Child.prototype.__proto__);

		it('passed Child.prototype.__proto__ should return null on className', () => {
			className === null ? true.should.be.true() : true.should.be.false()
		});
		it('passed Child.prototype.__proto__ should return null on constructor', () => {
			constructor === null ? true.should.be.true() : true.should.be.false()
		});
	});

	describe('method constructClass class child extends parent + human + HTMLElement', () => {

		class Human { a() {} b(){} }
		class Parent extends Human { c() {} d(){} }
		class Child extends Parent { e() {} f(){} }

		let CollectionOfClasses = CustomElement.explodeByExtends(Child);

		it('should return array length', () => {
			CollectionOfClasses.should.have.length(3);
		});

		it('should return child + parent + human separated in array', () => {
			CollectionOfClasses[0][0].should.be.equal('Child');
			CollectionOfClasses[1][0].should.be.equal('Parent');
			CollectionOfClasses[2][0].should.be.equal('Human');
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


	describe('method register passed class Red', () => {

		class Red {
			foo() {}
			bar() {}
			baz() {}
		}

		CustomElement.register(Red);

		it('should return by default instanceof HTMLElement if no second argument passed', () => {
			let red = Red.instance();
			red.should.be.instanceOf(HTMLElement);
		});

	});

	describe('method register passed class Green and as second parameter HTMLFormElement', () => {

		class Green {
			foo() {}
			bar() {}
			baz() {}
		}

		CustomElement.register(Green, HTMLFormElement);

		it('should return instanceof HTMLFormElement', () => {
			let green = Green.instance();
			green.should.be.instanceOf(HTMLFormElement);
		});

	});

	describe('method register (integration Test) passed class yellow with many parents', () => {

		class Foo {
			parentMethodCall(){
				this.$  = {
					parentMethodCall : true
				}
			}
			a() { return 'a'; }
			b() { return 'b'; }
		}
		class Bar extends Foo {
			parentMethodCall(){
				super.parentMethodCall();
			}
			c() { return 'c'; }
			d() { return 'd'; }
		}
		class Baz extends Bar {
			parentMethodCall(){
				super.parentMethodCall();
			}
			e() { return 'e'; }
			f() { return 'f'; }
		}

		class Yellow extends Baz {
			parentMethodCall(){
				super.parentMethodCall();
			}
			createdCallback() {
				this.$ = { createdCallback : true };
			}
			attachedCallback() {
				this.$ = { attachedCallback : true }
			}
			attributeChangedCallback(attrName, oldVal, newVal) {
				this.$ = {
					attributeChangedCallback : {
						attrName,
						newVal,
					}
				}
			}
			detachedCallback() {
				this.$ = { detachedCallback : true }
			}
		}

		CustomElement.register(Yellow, HTMLFormElement);

		it('should return method name on call method x', () => {
			let yellow = Yellow.instance();
			yellow.a().should.be.equal('a');
			yellow.b().should.be.equal('b');
			yellow.c().should.be.equal('c');
			yellow.d().should.be.equal('d');
			yellow.e().should.be.equal('e');
			yellow.f().should.be.equal('f');
		});

		it('should return Foo parentMethodCall on call yellow.parentMethodCall()', () => {
			let yellow = Yellow.instance();
			yellow.parentMethodCall();
			yellow.$.parentMethodCall.should.be.true();
		});

		it('should call createdCallback on creating instance', () => {
			let yellow = Yellow.instance();
			yellow.$.createdCallback.should.be.true();
		});

		it('should call attachedCallback on append instance to dom', () => {
			let yellow = Yellow.instance();
			document.body.appendChild(yellow);
			yellow.$.attachedCallback.should.be.true();
		});

		it('should call attributeChangedCallback if set attribute', () => {
			let yellow = Yellow.instance();
			yellow.setAttribute('fooattr', 111);
			yellow.$.attributeChangedCallback.attrName.should.be.equal('fooattr');
			yellow.$.attributeChangedCallback.newVal.should.be.equal('111');
		});

		it('should call detachedCallback on deleted from dom', () => {
			let yellow = Yellow.instance();
			document.body.appendChild(yellow);
			yellow.classList.add('for-deleting');
			yellow.parentNode.removeChild(yellow);
			yellow.$.detachedCallback.should.be.true();
		});

	});

});
