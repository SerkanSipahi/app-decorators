
// internal libs
import { component, view } from 'src/app-decorators';
import { Object } from 'core-js/library';

// external libs
import $ from 'jquery';

describe('@view decorator', () => {

	describe('helper.registerTemplate/registerBind/registerNamespaces and registerOnCreatedCallback  (unit-test)', () => {

		it('should create right namespace object', () => {

			view.helper.registerNamespaces({}).should.have.propertyByPath('$appDecorators', 'view', 'bind');
			view.helper.registerNamespaces({}).should.have.propertyByPath('$appDecorators', 'view', 'template');

		});

		it('should works as accepted ', (done) => {

			@component(HTMLElement)
			class Manually {}

			let target = Manually.prototype;

			// register namespaces
			view.helper.registerNamespaces(target);

			// register template
			view.helper.registerTemplate(target, '<div class="{{className}}>{{content}}</div>');

			// register binds
			view.helper.registerBind(target, 'className', 'foo');
			view.helper.registerBind(target, 'content', 'Hello World');

			view.helper.registerOnCreatedCallback(target, function(instance, createVars){

				// test registerBind
				instance.should.have.propertyByPath('$appDecorators', 'view', 'bind', 'className').eql('foo');
				instance.should.have.propertyByPath('$appDecorators', 'view', 'bind', 'content').eql('Hello World');

				// test template
				instance.should.have.propertyByPath('$appDecorators', 'view', 'template', 'base').eql('<div class="{{className}}>{{content}}</div>');

				// test create vars
				createVars.should.have.propertyByPath('className').eql('baz');
				createVars.should.have.propertyByPath('content').eql('Hello Mars');

				// test instanceof
				instance.should.instanceOf(Manually);

				// finish
				done()
			});

			let manually = Manually.create({className: 'baz', content: 'Hello Mars'});

		});

	})

	describe('in usage with @  (integration-test)', () => {

		beforeEach(function() {
	      	$('body').append('<div id="view-decorator" />');
	    });

		afterEach(function() {
	  		$('#view-decorator').remove();
		});

		// test
		it('should also create a element if element created from out of dom', () => {

			// decorate
			@view(`<span>{{n}}</span><p>{{p}}</p>`)
			@component(HTMLElement)
			class serkan {

				@view.bind n = 'Hello';
				@view.bind p = 'World';

				created(){

				}
			}

			// First test
			let $vc = $('#view-decorator');
			$vc.append('<com-serkan></com-serkan><com-serkan></com-serkan>');
			$vc.find('com-serkan').get(0).outerHTML.should.equal('<com-serkan><span>Hello</span><p>World</p></com-serkan>');

			// Second test
			$vc.find('com-serkan').get(0).p = 'Mars';
			$vc.find('com-serkan').get(0).outerHTML.should.equal('<com-serkan><span>Hello</span><p>Mars</p></com-serkan>');
			$vc.find('com-serkan').get(1).outerHTML.should.equal('<com-serkan><span>Hello</span><p>World</p></com-serkan>');

		});

		it('should also create a element if element created from out of dom', () => {

			// decorate
			@view(`<span>{{uid}}.)<b>{{class}}</b>{{b}}</span><p>{{c}}</p>`)
			@component(HTMLElement)
			class Fire {}

			let $vc = $('#view-decorator');
			$vc.append(`
				<com-fire uid="1" class="First" @view.bind.b="Thats" @view.bind.c="awesome!"></com-fire>
				<com-fire uid="2" class="Second" @view.bind.b="Whats" @view.bind.c="up!"></com-fire>
			`);

			$vc.find('com-fire').get(0).outerHTML.should.equal('<com-fire uid="1" class="First"><span>1.)<b>First</b>Thats</span><p>awesome!</p></com-fire>');
			$vc.find('com-fire').get(1).outerHTML.should.equal('<com-fire uid="2" class="Second"><span>2.)<b>Second</b>Whats</span><p>up!</p></com-fire>');

			$vc.find('com-fire').get(1).c = 'on!';
			$vc.find('com-fire').get(1).outerHTML.should.equal('<com-fire uid="2" class="Second"><span>2.)<b>Second</b>Whats</span><p>on!</p></com-fire>');

			// should not render because uid is not a @view property
			$vc.find('com-fire').get(1).uid = 333;
			$vc.find('com-fire').get(1).outerHTML.should.equal('<com-fire uid="2" class="Second"><span>2.)<b>Second</b>Whats</span><p>on!</p></com-fire>');

		});

		it('should render template if call domNode.render directly or over domNode.$.view.render', () => {

			let $vc = $('#view-decorator');
			$vc.append(`<com-serkan></com-serkan>`);

			$vc.find('com-serkan').get(0).render({n: 'Cool', p: 'man!'});
			$vc.find('com-serkan').get(0).outerHTML.should.equal('<com-serkan><span>Cool</span><p>man!</p></com-serkan>');

			$vc.find('com-serkan').get(0).$.view.render({n: 'Hey', p: 'there!'});
			$vc.find('com-serkan').get(0).outerHTML.should.equal('<com-serkan><span>Hey</span><p>there!</p></com-serkan>');

		})

		class Core {
			x = 1;
			y = 2;
			z = 3;
		}

		// decorate
		@view(`<div>{{name}}</div><div>{{city}}</div><div>{{country}}</div>`)
		@component(HTMLElement)
		class Orange extends Core {

			@view.bind name = 'A-Df';
		    @view.bind city = 'B-Df';
		    @view.bind country = 'C-Df';

			phone = 12345;

			created(create_vars){
				Object.assign(this, create_vars);
			}

		}

		// test
		it('should render the right template on using @view and @view.bind', () => {

			// domNode testing
			let orange_0 = Orange.create();
			let orange_1 = Orange.create({city: 'New York', xyz: 7777});
			let orange_2 = Orange.create({name: 'A-1', city: 'B-1', country: 'C-1'});
			let orange_3 = Orange.create({name: 'A-2', city: 'B-2', country: 'C-2', phone: 9999});

			let equal_3 = '<com-orange><div>A-2</div><div>B-2</div><div>C-2</div></com-orange>';
			orange_3.outerHTML.should.equal(equal_3);
			orange_3.phone.should.equal(9999);

			let equal_2 = '<com-orange><div>A-1</div><div>B-1</div><div>C-1</div></com-orange>';
			orange_2.outerHTML.should.equal(equal_2);

			let equal_0 = '<com-orange><div>A-Df</div><div>B-Df</div><div>C-Df</div></com-orange>';
			orange_0.outerHTML.should.equal(equal_0);
			orange_0.phone.should.equal(12345);

			let equal_1 =  '<com-orange><div>A-Df</div><div>New York</div><div>C-Df</div></com-orange>';
			orange_1.outerHTML.should.equal(equal_1);
			orange_1.xyz.should.equal(7777);

			// dom testing
			$([orange_1, orange_3, orange_0, orange_2]).appendTo('#view-decorator');
			$('#view-decorator').html().should.equal(equal_1+equal_3+equal_0+equal_2);

			orange_3.city = '[update]';
			$('#view-decorator').html().should.equal(
				equal_1+
				'<com-orange><div>A-2</div><div>[update]</div><div>C-2</div></com-orange>'+
				equal_0+
				equal_2
			);

			orange_0.x.should.equal(1);
			orange_0.y.should.equal(2);
			orange_0.z.should.equal(3);

		});

		it('should get default view properties', () => {

			let orange = Orange.create();
			orange.name.should.equal('A-Df');
			orange.city.should.equal('B-Df');
			orange.country.should.equal('C-Df');

		});

		it('should get passed view properties', () => {

			let orange = Orange.create({name: 'A-2', city: 'B-2'});
			orange.name.should.equal('A-2');
			orange.city.should.equal('B-2');
			orange.country.should.equal('C-Df');

		});

		it('should not render phone because is not part of @view.bind', () => {

			let orange_0 = Orange.create();
			orange_0.$.view._template['test-tpl'] = '<div>{{name}}</div><div>{{city}}</div><div>{{country}}</div>{{phone}}';
			orange_0.$.view.render({}, 'test-tpl');
			orange_0.outerHTML.should.equal('<com-orange><div>A-Df</div><div>B-Df</div><div>C-Df</div></com-orange>');

		});

	});

});
