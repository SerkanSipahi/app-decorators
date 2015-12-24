
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

		it('should return child as constructor name', () => {
			CustomElement.getClassName(Child).should.be.equal('Child');
		});

		it('should return child constructor typeof function', () => {
			CustomElement.getConstructor(Child).toString().should.match(/function Child/);
		});

		it('should have properties of Child', () => {

			let instanceMethods = CustomElement.getInstanceMethods(Child);

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

			let staticMethods = CustomElement.getStaticMethods(Child);

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

		it('passed Child.prototype.__proto__ should return null on className', () => {
			let className = CustomElement.getClassName(Child.prototype.__proto__);
			className === null ? true.should.be.true() : true.should.be.false()
		});
		it('passed Child.prototype.__proto__ should return null on constructor', () => {
			let constructor = CustomElement.getConstructor(Child.prototype.__proto__);
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
			CollectionOfClasses[0][0].name.should.be.equal('Child');
			CollectionOfClasses[1][0].name.should.be.equal('Parent');
			CollectionOfClasses[2][0].name.should.be.equal('Human');
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
			let red = Red.create();
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
			let green = Green.create();
			green.should.be.instanceOf(HTMLFormElement);
		});

	});

	describe('method register passed ES5 class', () => {

		function Blue(){}
		Blue.prototype.a = function(){};
		Blue.prototype.b = function(){};
		Blue.prototype.c = function(){};
		Blue.prototype.created = function() {}
		Blue.prototype.attached = function() {}
		Blue.prototype.attributeChanged = function(attrName, oldVal, newVal) {}
		Blue.prototype.detached = function() {}

		CustomElement.register(Blue);

		it('should return instanceof HTMLFormElement', () => {
			let blue = Blue.create();
			blue.should.be.instanceOf(HTMLElement);
		});

		it('should have properties of function Blue()', () => {
			let blue = Blue.create();
			blue.should.have.property('a');
			blue.should.have.property('b');
			blue.should.have.property('c');
			// webcomponents callbacks
			blue.should.have.property('created');
			blue.should.have.property('attached');
			blue.should.have.property('attributeChanged');
			blue.should.have.property('detached');
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

			static a = 12;
			static b = 34;

			c = 56;
			d = 78;

			parentMethodCall(){
				super.parentMethodCall();
			}
			created() {
				this.$ = {
					createdCallback : true,
					static_a: Yellow.a,
					static_b: Yellow.b,
				};
			}
			attached() {
				this.$ = { attachedCallback : true }
			}
			attributeChanged(attrName, oldVal, newVal) {
				this.$ = {
					attributeChangedCallback : {
						attrName,
						newVal,
					}
				}
			}
			detached() {
				this.$ = { detachedCallback : true }
			}
		}

		CustomElement.register(Yellow, HTMLFormElement);

		it('should return method name on call method x', () => {
			let yellow = Yellow.create();
			yellow.a().should.be.equal('a');
			yellow.b().should.be.equal('b');
			yellow.c().should.be.equal('c');
			yellow.d().should.be.equal('d');
			yellow.e().should.be.equal('e');
			yellow.f().should.be.equal('f');
		});

		it('should return Foo parentMethodCall on call yellow.parentMethodCall()', () => {
			let yellow = Yellow.create();
			yellow.parentMethodCall();
			yellow.$.parentMethodCall.should.be.true();
		});

		it('should call createdCallback on creating instance', () => {
			let yellow = Yellow.create();
			yellow.$.createdCallback.should.be.true();
		});

		it('should call attachedCallback on append instance to dom', () => {
			let yellow = Yellow.create();
			document.body.appendChild(yellow);
			yellow.$.attachedCallback.should.be.true();
		});

		it('should call attributeChangedCallback if set attribute', () => {
			let yellow = Yellow.create();
			yellow.setAttribute('fooattr', 111);
			yellow.$.attributeChangedCallback.attrName.should.be.equal('fooattr');
			yellow.$.attributeChangedCallback.newVal.should.be.equal('111');
		});

		it('should call detachedCallback on deleted from dom', () => {
			let yellow = Yellow.create();
			document.body.appendChild(yellow);
			yellow.classList.add('for-deleting');
			yellow.parentNode.removeChild(yellow);
			yellow.$.detachedCallback.should.be.true();
		});

		it('should return static properties', () => {

			let yellow = Yellow.create();
			yellow.$.static_a.should.equal(12);
			yellow.$.static_b.should.equal(34);

		});

		/**
		 * Do not forgot to implement the test
		 * Can be resolved with CustomElement.resolveClassInComponents
		 * by adding this infos to Class and add $onCreatedCallback
		 * to instance
		 */
		it.skip('should return instance properties', () => {

			let orange_0 = Orange.create();
			orange_0.c.should.equal(56);

			let orange_1 = Orange.create({phone: 67890 });
			orange_1.d.should.equal(78);

		});

		/**
		 * Do not forgot to implement the test
		 */
		it.skip('should be called created callback only once', () => {

		});

	});

});
