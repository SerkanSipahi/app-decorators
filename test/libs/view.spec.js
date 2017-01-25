import { View, VARS, NO_VARS, PRE_COMPILED } from 'src/libs/view';
import Handlebars from '../../node_modules/handlebars/dist/handlebars';

describe('class View', () => {

	describe('new View()', () => {

		it('should throw error if initialized without options', () => {

			(() => new View()).should.throw(`
				Required: rootNode.
				Optional: use prerenderer when template/s are precompiled.
				Optional: use precompiler when render raw template string.
			`);

		});

		it('should not throw error if minimum options passed', () => {

			(() => { new View({
				rootNode: document.createElement('p'),
			}); }).should.not.throw();

			(() => { new View({
				rootNode: document.createElement('p'),
				precompiler: Handlebars.precompile,
			}); }).should.not.throw();

			(() => { new View({
				rootNode: document.createElement('p'),
				prerenderer: Handlebars.template,
			}); }).should.not.throw();

		})

	});

	describe('method set/get', () => {

		it('should accept args as string and objects', () => {

			let view = new View({
				rootNode: document.createElement('div'),
			});

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

			let view = new View({
				rootNode: document.createElement('p'),
				template: '<div>{{foo}}</div><span>{{bar}}</span>',
				precompiler: Handlebars.precompile,
				prerenderer: Handlebars.template,
			});

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

	describe('method _getTemplateType', () => {

		it('should determine template type', () => {

			let view = new View({
				rootNode: document.createElement('div'),
			});

			view._getTemplateType("Hello World").should.be.equal(NO_VARS);
			view._getTemplateType("Hello {{foo}}").should.be.equal(VARS);
			view._getTemplateType({}).should.be.equal(PRE_COMPILED);

		});

	});

	describe('method compile', () => {

		let view = null;

		beforeEach(() => {

			view = new View({
				rootNode: document.createElement('p'),
				precompiler: Handlebars.precompile,
				prerenderer: Handlebars.template,
			});

		});

		afterEach(() => {
			view = null;
		});

		it('should compile given NO_VARS template', () => {

			let template = view.compile(NO_VARS, 'Hello World {{ignore}}');
			template({ ignore: 'foo' }).should.be.equal('Hello World {{ignore}}');

		});

		it('should compile given VARS template', () => {

			let template = view.compile(VARS, '{{foo}} {{bar}}');
			template({ foo: 'hello', bar: 'world' }).should.be.equal('hello world');

		});

		it('should compile given PRE_COMPILED template', () => {

			let precompiled = view._precompile('{{foo}} {{bar}}');
			let template = view.compile(PRE_COMPILED, precompiled);
			template({ foo: 'hello', bar: 'world' }).should.be.equal('hello world');

		});

	});

	describe('method setTemplate', () => {

		let view = null;
		let spy_compile = null;

		beforeEach(() => {

			spy_compile = sinon.spy(View.prototype, "compile");

			view = new View({
				rootNode: document.createElement('p'),
				precompiler: Handlebars.precompile,
				prerenderer: Handlebars.template,
			});
		});

		afterEach(() => {
			view = null;
			spy_compile.restore();
		});

		it('should call compile with with "NO_VARS" arg', () => {

			view.setTemplate('<div>Hello</div><span>World</span>');
			spy_compile.args[0][0].should.be.equal('NO_VARS');
			spy_compile.args[0][2].should.be.equal('base');

		});

		it('should call compile with with "VARS" arg', () => {

			view.setTemplate('<div>{{foo}}</div><span>{{bar}}</span>');
			spy_compile.args[0][0].should.be.equal('VARS');
			spy_compile.args[0][2].should.be.equal('base');

		});

		it('should call compile with with "PRE_COMPILED" arg', () => {

			let precompiled = view._precompile('{{foo}} {{bar}}');

			view.setTemplate(precompiled);
			spy_compile.args[0][0].should.be.equal('PRE_COMPILED');
			spy_compile.args[0][2].should.be.equal('base');

		});

		it('should throw error when not set template', () => {

			let expectedErrorMessage = /setTemplate: an error occurred: unknown template type/;

			(() => view.setTemplate()).should.throw(expectedErrorMessage);
			(() => view.setTemplate(function(){})).should.throw(expectedErrorMessage);
			(() => view.setTemplate(() => {})).should.throw(expectedErrorMessage);
			(() => view.setTemplate(null)).should.throw(expectedErrorMessage);
			(() => view.setTemplate(undefined)).should.throw(expectedErrorMessage);
			(() => view.setTemplate(true)).should.throw(expectedErrorMessage);
			(() => view.setTemplate([])).should.throw(expectedErrorMessage);

		});

	});

	describe('initialized method', () => {

		it('should initialize view', () => {

			let view = new View({
				rootNode: document.createElement('p'),
				precompiler: Handlebars.precompile,
				prerenderer: Handlebars.template,
			});

			view.initialized().should.be.true();

		});

	});

	describe('delete method', () => {

		it('should delete initialized view', () => {

			let view = new View({
				rootNode: document.createElement('p'),
				precompiler: Handlebars.precompile,
				prerenderer: Handlebars.template,
			});

			view.destroy();
			view.initialized().should.be.false();

		});

	});

	describe('reinit method', () => {

		it('should reinit view after deleting', () => {

			let options = {
				rootNode: document.createElement('p'),
				precompiler: Handlebars.precompile,
				prerenderer: Handlebars.template,
			};

			let view = new View(options);

			view.destroy();
			view.reinit(options);
			view.initialized().should.be.true();

		});

	});

	describe('reinit method"', () => {

		it('should throw error if reinit called without options parameter', () => {

			let view = new View({
				rootNode: document.createElement('p'),
				precompiler: Handlebars.precompile,
				prerenderer: Handlebars.template,
			});

			view.destroy();

			(() => view.reinit()).should.throw(`
				Required: rootNode.
				Optional: use prerenderer when template/s are precompiled.
				Optional: use precompiler when render raw template string.
			`);

		});

	});

	describe('method "render"', () => {


	});

	describe('method "create"', () => {

		it('should render expected template', () => {

			let view = new View({
				precompiler: Handlebars.precompile,
				prerenderer: Handlebars.template,
				rootNode: document.createElement('p'),
				vars: {
					foo: 'Hello',
					bar: 'World!'
				},
				template: '<div class="foo">{{foo}}</div><div class="bar">{{bar}}</div>',
			});

			view.render();

			view.renderedTemplate.should.equal('<div class="foo">Hello</div><div class="bar">World!</div>');
			view.el.outerHTML.should.equal('<p rendered="true"><div class="foo">Hello</div><div class="bar">World!</div></p>');

		});

	});

	describe('innerHTML + slot', () => {

		it('should append innerHTML nodes to "slot" node', () => {

			let rootNode = document.createElement('p');
			rootNode.innerHTML = '<ul><li> nok nok </li></ul>';

			let view = new View({
				precompiler: Handlebars.precompile,
				prerenderer: Handlebars.template,
				rootNode: rootNode,
				vars: {
					foo: 'Thats',
					bar: 'nice'
				},
				template: '<div class="foo">{{foo}}</div><slot></slot><div class="bar">{{bar}}</div>',
			});

			view.render(null, { renderedFlag: false });

			view.el.outerHTML.should.equal('<p><div class="foo">Thats</div><slot><ul><li> nok nok </li></ul></slot><div class="bar">nice</div></p>');

		});

	});

	describe('innerHTML + hole', () => {

		it.skip('should replace himself with given selector', () => {

			let rootNode = document.createElement('p');
			rootNode.innerHTML = '<span>Hello World</div>';

			let view = new View({
				precompiler: Handlebars.precompile,
				prerenderer: Handlebars.template,
				rootNode: rootNode,
				vars: {
					foo: 'Thats',
					bar: 'nice'
				},
				template: '<div class="foo">{{foo}}</div><hole></hole><div class="bar">{{bar}}</div>',
			});

			view.render(null, { renderedFlag: false });
			view.replaceSelf('black-hole');
			view.el.outerHTML.should.equal('<div boundary="" class="foo">Thats</div><p rendered="true"><span>Hello World</div></p><div class="bar">nice</div>');

		});

	});

	describe('render() method', () => {

		it('should not render because rendered attribute flag is set or only when explicitly wanted', () => {

			let rootNode = document.createElement('my-element');
			rootNode.setAttribute('rendered', true);
			rootNode.innerHTML = 'Should not rendered';

			let view = new View({
				precompiler: Handlebars.precompile,
				prerenderer: Handlebars.template,
				rootNode: rootNode,
				vars: {
					foo: 'Gokcen'
				},
				template: '<div class="foo">{{foo}}</div>',
			});

			// should not render because rendered flag is set
			view.render();
			view.getRootNode().outerHTML.should.equal('<my-element rendered="true">Should not rendered</my-element>');

			// explicitly wanted to render because force = true is set
			view.render(null, { force: true });
			view.el.outerHTML.should.equal('<my-element rendered="true"><div class="foo">Gokcen</div></my-element>');

		});

		it('should render only once if called many times or render force true', () => {

			let spy_setAttribute = sinon.spy(View.prototype, "setAttribute");
			let spy_getAttribute = sinon.spy(View.prototype, "getAttribute");

			let view = new View({
				precompiler: Handlebars.precompile,
				prerenderer: Handlebars.template,
				rootNode: document.createElement('my-element'),
				vars: {
					foo: 'Liya'
				},
				template: '<div class="foo">{{foo}}</div>',
			});

			// first render call should render
			view.render();
			view.el.outerHTML.should.equal('<my-element rendered="true"><div class="foo">Liya</div></my-element>');

			spy_getAttribute.callCount.should.equal(1);
			spy_getAttribute.args[0][1].should.equal('rendered');

			spy_setAttribute.callCount.should.equal(1);
			spy_setAttribute.args[0][1].should.equal('rendered');

			// second render call should not render
			view.render();
			spy_getAttribute.callCount.should.equal(2);
			spy_setAttribute.callCount.should.equal(1);

			// third render call should render due "force:true"
			view.render(null, {force: true});
			spy_getAttribute.callCount.should.equal(3);
			spy_setAttribute.callCount.should.equal(2);

			//cleanup spy
			View.prototype.getAttribute.restore();
			View.prototype.setAttribute.restore();

		});

	});

});
