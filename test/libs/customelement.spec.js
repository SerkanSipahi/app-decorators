
import CustomElement from 'src/libs/customelement';

describe('Class CustomElement', () => {

	describe('method convertToValidComponentName', () => {

		it('should add a component prefix by default', () => {
			CustomElement.convertToValidComponentName('foo').should.be.equal('com-foo');
		});

		it('should add a component by passed prefix', () => {
			CustomElement.convertToValidComponentName('foo', 'x').should.be.equal('x-foo');
		});

	});

	describe('method extractPrototype', () => {

		class Blue {
			foo() {}
			bar() {}
			baz() {}
		}

		let extractedPrototype = CustomElement.extractPrototype(Blue);

		it('should return excepted methods by given Class', () => {
			extractedPrototype.should.have.property('foo');
			extractedPrototype.should.have.property('bar');
			extractedPrototype.should.have.property('baz');
			extractedPrototype.should.not.have.ownProperty('constructor');
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

	describe('method register passed class yellow', () => {

		class Yellow {
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
