
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

		it('should ', (done) => {

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

		// decorate
		@view(`<div>{{name}}</div><div>{{city}}</div><div>{{country}}</div>`)
		@component(HTMLElement)
		class Orange {

			@view.bind name = 'A-Df';
		    @view.bind city = 'B-Df';
		    @view.bind country = 'C-Df';

			phone = 2233445;

		}

		// test
		it('should render the right template on using @view and @view.bind', () => {

			// domNode testing
			let orange_0 = Orange.create();
			let orange_1 = Orange.create({city: 'New York'});
			let orange_2 = Orange.create({name: 'A-1', city: 'B-1', country: 'C-1'});
			let orange_3 = Orange.create({name: 'A-2', city: 'B-2', country: 'C-2'});

			let equal_3 = '<com-orange><div>A-2</div><div>B-2</div><div>C-2</div></com-orange>';
			orange_3.outerHTML.should.equal(equal_3);

			let equal_2 = '<com-orange><div>A-1</div><div>B-1</div><div>C-1</div></com-orange>';
			orange_2.outerHTML.should.equal(equal_2);

			let equal_0 = '<com-orange><div>A-Df</div><div>B-Df</div><div>C-Df</div></com-orange>';
			orange_0.outerHTML.should.equal(equal_0);

			let equal_1 =  '<com-orange><div>A-Df</div><div>New York</div><div>C-Df</div></com-orange>';
			orange_1.outerHTML.should.equal(equal_1);

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

		});

		it('should not render phone because is not part of @view.bind', () => {

			let orange_0 = Orange.create();
			orange_0.$.view._template['test-tpl'] = '<div>{{name}}</div><div>{{city}}</div><div>{{country}}</div>{{phone}}';
			orange_0.$.view.render({}, 'test-tpl');
			orange_0.outerHTML.should.equal('<com-orange><div>A-Df</div><div>B-Df</div><div>C-Df</div></com-orange>');

		});

	});

});
