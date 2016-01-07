
import View from 'src/libs/view';
import Handlebars from 'handlebars';

describe('View Class', () => {

	describe('methods', () => {

		let view = null;

		beforeEach(() => {
			view = new View();
		});

		it('should accept args as string and objects', () => {

			view.set('foo', 1);
			view.set('bar', 2);
			view.set('baz', 3);

			// test
			view.get('foo').should.eql(1);
			view.get('bar').should.eql(2);
			view.get('baz').should.eql(3);

			// override bar
			view.set('bar', 999);

			// test again
			view.get('foo').should.eql(1);
			view.get('bar').should.eql(999);
			view.get('baz').should.eql(3);

			// test length of vars
			Object.keys(view.getVars()).should.length(3);

			view.set({
				foo: 11,
				baz: 33,
				bazinga: {
					what : { the : { f: '!' } }
				}
			});

			view.get('foo').should.eql(11);
			view.get('bar').should.eql(999);
			view.get('baz').should.eql(33);
			view.get('bazinga').should.have.propertyByPath('what', 'the', 'f').eql('!');

			// test length of vars
			Object.keys(view.getVars()).should.length(4);

		});

		it('should render passed args with right setup', () => {

			// setup
			view.setDomNode(document.createElement('p'));
			view.setRenderer(Handlebars);
			view.setTemplate('<div>{{foo}}</div><span>{{bar}}</span>');
			view.set({
				foo: 'Hello',
				bar: 'Mars',
			});

			// tests
			view.render().rendered.should.equal('<div>Hello</div><span>Mars</span>');
			view.getDomNode().outerHTML.should.equal('<p><div>Hello</div><span>Mars</span></p>');

		});

	});

	describe('static method', () => {

		describe('extractViewVarFromDomAttributes', () => {

			let MockDomNode = {
				attributes : {
					0: { name: 'class', value: 'foo' },
					1: { name: '@view.bind.x', value: 'bar' },
					2: { name: '@view.bind.b', value: 'baz' },
				},
				removeAttribute : () => {}
			}

			it('it should return objectlist of dom attributes that matched of regex', () => {
				let attributeList = View.extractViewVarFromDomAttributes(MockDomNode);
				// positiv test
				attributeList.should.have.propertyByPath('x').eql('bar');
				attributeList.should.have.propertyByPath('b').eql('baz');
				// negativ test
				attributeList.should.not.have.propertyByPath('class');
			});

		});

	});

	describe('with all passed arguments over .create', () => {

		it('should render accepted template', () => {

			let view = View.create({
				uuid: 1,
				domNode: document.createElement('div'),
				vars: { foo: 'Hello', bar: 'World!' },
				renderer: Handlebars,
				template: '<div class="foo">{{foo}}</div><div class="bar">{{bar}}</div>',
			});

			view.render().rendered.should.equal('<div class="foo">Hello</div><div class="bar">World!</div>');

		});

	});

});
