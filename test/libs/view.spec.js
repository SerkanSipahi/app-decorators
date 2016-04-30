
import View from 'src/libs/view';
import { Handlebars } from '../../src/libs/dependencies';

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
			view.setRootNode(document.createElement('p'));
			view.setTemplateNode(document.createElement('div'));
			view.setRenderer(Handlebars);
			view.setTemplate('<div>{{foo}}</div><span>{{bar}}</span>');
			view.set({
				foo: 'Hello',
				bar: 'Mars',
			});

			// tests
			view.render(null, { renderedFlag: false });

			view.renderedTemplate.should.equal('<div>Hello</div><span>Mars</span>');
			view.el.outerHTML.should.equal('<p><div>Hello</div><span>Mars</span></p>');

		});

	});

	describe('with all passed arguments over .create', () => {

		it('should render accepted template', () => {

			let view = View.create({
				rootNode: document.createElement('p'),
				templateNode: document.createElement('div'),
				vars: { foo: 'Hello', bar: 'World!' },
				renderer: Handlebars,
				template: '<div class="foo">{{foo}}</div><div class="bar">{{bar}}</div>',
			});

			view.render();

			view.renderedTemplate.should.equal('<div class="foo">Hello</div><div class="bar">World!</div>');
			view.el.outerHTML.should.equal('<p rendered="true"><div class="foo">Hello</div><div class="bar">World!</div></p>');

		});

	});

	describe('replaceNode method', () => {

		it('should replace given node with given selector', () => {

			let view = View.create({
				rootNode: document.createElement('p'),
				templateNode: document.createElement('div'),
				vars: { foo: 'Thats', bar: 'nice' },
				renderer: Handlebars,
				template: '<div class="foo">{{foo}}</div><inner-component></inner-component><div class="bar">{{bar}}</div>',
			});

			view.render(null, { renderedFlag: false });

			let pNode = document.createElement('p');
			pNode.innerHTML = '<ul><li> nok nok </li></ul>'
			view.replaceNode('inner-component', pNode.querySelector('ul'));

			view.el.outerHTML.should.equal('<p><div class="foo">Thats</div><ul><li> nok nok </li></ul><div class="bar">nice</div></p>');

		})

	});

	describe('render() method', () => {

		it('should render only once if called many times or render force true', () => {

			let spy_setAttribute = sinon.spy(View.prototype, "setAttribute");
			let spy_getAttribute = sinon.spy(View.prototype, "getAttribute");

			let view = View.create({
				rootNode: document.createElement('my-element'),
				templateNode: document.createElement('div'),
				vars: { foo: 'Liya' },
				renderer: Handlebars,
				template: '<div class="foo">{{foo}}</div>',
			});

			view.render();

			// first render call should render
			view.el.outerHTML.should.equal('<my-element rendered="true"><div class="foo">Liya</div></my-element>');

			spy_getAttribute.callCount.should.equal(1);
			spy_getAttribute.args[0][1].should.equal('rendered');

			spy_setAttribute.callCount.should.equal(1);
			spy_setAttribute.args[0][1].should.equal('rendered');

			// second render call should not render
			view.render();
			spy_getAttribute.callCount.should.equal(2);
			spy_setAttribute.callCount.should.equal(1);

			// third render call should render
			view.render(null, {force: true});
			spy_getAttribute.callCount.should.equal(3);
			spy_setAttribute.callCount.should.equal(2);

		});

	});

});
