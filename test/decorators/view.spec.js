import $ from 'jquery';
import { bootstrapPolyfills } from 'src/bootstrap';
import { EVENT_VIEW_RENDER } from 'src/libs/view';
import { delay } from 'src/helpers/delay';
import { storage } from "src/libs/random-storage";


import sinon from 'sinon';

// init special innerHTML for test
String.prototype.removeGutter = function(){
	return this.replace(/[\t\n\r]/gm, '');
};

describe('@view decorator', async () => {

	await bootstrapPolyfills;
	let { component, view, on } = await System.import('app-decorators');

	describe('in usage with @  (integration-test)', () => {

		beforeEach(() =>
	      	$('body').append('<div id="view-decorator"></div>')
	    );

		afterEach(() =>
	  		$('#view-decorator').remove()
		);

		// decorate
		@view(`
			<span>{{n}}</span><p>{{p}}</p>
		`)
		@component()
		class serkan {
			@view.bind n = 'Hello';
			@view.bind p = 'World';
		}

		it('should also create a element if element created from out of dom', done => {

			(async () => {

			// First test
			let $vc = $('#view-decorator');
			$vc.append(`
				<com-serkan id="serkan-1"></com-serkan>
				<com-serkan id="serkan-2"></com-serkan>
			`);

			let $serkan1 = $vc.find('com-serkan#serkan-1');
			let $serkan2 = $vc.find('com-serkan#serkan-2');

			await delay(10);

			// Test-1: check if rendered
			$serkan1.attr('rendered').should.be.equal('true');
			$serkan1.html().removeGutter().should.be.equal('<span>Hello</span><p>World</p>');

			// Test-2: check if rendered
			$serkan2.attr('rendered').should.be.equal('true');
			$serkan2.html().removeGutter().should.be.equal('<span>Hello</span><p>World</p>');

			// Test-3: check if rendered on write view.bind attri
			$serkan1.get(0).p = 'Mars';
			$serkan2.get(0).p = 'Pluto';

			$serkan1.html().removeGutter().should.be.equal('<span>Hello</span><p>Mars</p>');
			$serkan2.html().removeGutter().should.be.equal('<span>Hello</span><p>Pluto</p>');

			done();

			})();

		});

		it('should also create a element if element with view vars although created from out of dom', done => {

			(async () => {

			// decorate
			@view(`<span>{{id}}.)<b>{{class}}</b>{{b}}</span><p>{{c}}</p>`)
			@component()
			class Fire {}

			let $vc = $('#view-decorator');
			$vc.append(`
				<com-fire id="id-1" class="First" @view.bind.b="Thats" @view.bind.c="awesome!"></com-fire>
				<com-fire id="id-2" class="Second" @view.bind.b="Whats" @view.bind.c="up!"></com-fire>
			`);

			let $fire1 = $vc.find('com-fire#id-1');
			let $fire2 = $vc.find('com-fire#id-2');

			await delay(10);

			$fire1.attr('rendered').should.equal('true');
			$fire1.html().should.equal('<span>id-1.)<b>First</b>Thats</span><p>awesome!</p>');

			$fire2.attr('rendered').should.equal('true');
			$fire2.html().should.equal('<span>id-2.)<b>Second</b>Whats</span><p>up!</p>');

			$fire1.get(0).c = 'on!';
			$fire2.get(0).c = 'waw!';

			$fire1.html().should.equal('<span>id-1.)<b>First</b>Thats</span><p>on!</p>');
			$fire2.html().should.equal('<span>id-2.)<b>Second</b>Whats</span><p>waw!</p>');

			done();

			})();

		});

		it('should render template if call domNode.render directly or over domNode.$.view.render', done => {

			(async () => {

			let $vc = $('#view-decorator');
			$vc.append(`<com-serkan></com-serkan>`);

			await delay(10);

			$vc.find('com-serkan').get(0).render({n: 'Cool', p: 'man!'}, { force: true });
			$vc.find('com-serkan').get(0).outerHTML.removeGutter().should.equal('<com-serkan rendered="true"><span>Cool</span><p>man!</p></com-serkan>');

			$vc.find('com-serkan').get(0).$view.render({n: 'Hey', p: 'there!'}, { force: true });
			$vc.find('com-serkan').get(0).outerHTML.removeGutter().should.equal('<com-serkan rendered="true"><span>Hey</span><p>there!</p></com-serkan>');

			done();

			})();

		});

		@view(`<div>{{name}}</div><div>{{city}}</div><div>{{country}}</div>`)
		@component()
		class Orange {

			@view.bind name = 'A-Df';
		    @view.bind city = 'B-Df';
		    @view.bind country = 'C-Df';

			created(create_vars){

				this.x = 1;
				this.y = 2;
				this.z = 3;
				this.phone = 12345;

				Object.assign(this, create_vars);
			}
		}

		it('should render the right template on using @view and @view.bind', () => {

			// should create template with default vars (see above @view.bind inside Orange)
			let orange_0 = Orange.create();
			// should override @view.bind default vars inside Oragen
			let orange_1 = Orange.create({city: 'New York', xyz: 7777});
			let orange_2 = Orange.create({name: 'A-1', city: 'B-1', country: 'C-1'});
			let orange_3 = Orange.create({name: 'A-2', city: 'B-2', country: 'C-2', phone: 9999});

			let equal_3 = '<com-orange rendered="true"><div>A-2</div><div>B-2</div><div>C-2</div></com-orange>';
			orange_3.outerHTML.should.equal(equal_3);
			orange_3.phone.should.equal(9999);

			let equal_2 = '<com-orange rendered="true"><div>A-1</div><div>B-1</div><div>C-1</div></com-orange>';
			orange_2.outerHTML.should.equal(equal_2);

			let equal_0 = '<com-orange rendered="true"><div>A-Df</div><div>B-Df</div><div>C-Df</div></com-orange>';
			orange_0.outerHTML.should.equal(equal_0);
			orange_0.phone.should.equal(12345);

			let equal_1 =  '<com-orange rendered="true"><div>A-Df</div><div>New York</div><div>C-Df</div></com-orange>';
			orange_1.outerHTML.should.equal(equal_1);
			orange_1.xyz.should.equal(7777);

			// dom testing
			$([orange_1, orange_3, orange_0, orange_2]).appendTo('#view-decorator');
			$('#view-decorator').html().should.equal(equal_1+equal_3+equal_0+equal_2);

			orange_3.city = '[update]';
			$('#view-decorator').html().should.equal(
				equal_1+
				'<com-orange rendered="true"><div>A-2</div><div>[update]</div><div>C-2</div></com-orange>'+
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

		it.skip('should not render phone because is not part of @view.bind', () => {

			let orange_0 = Orange.create();
			orange_0.$view._template['test-tpl'] = '<div>{{name}}</div><div>{{city}}</div><div>{{country}}</div>{{phone}}';
			orange_0.$view.render({}, 'test-tpl');
			orange_0.outerHTML.should.equal('<com-orange rendered="true"><div>A-Df</div><div>B-Df</div><div>C-Df</div></com-orange>');

		});

	});

	it('should not render because rendered flag is set', done => {

		(async () => {

		@view(`
			<div>Should render if flag is not set</div>
		`)
		@component({
			name: 'my-shouldnotrender'
		})
		class MyShouldnotrender {}

		$('body').append(`
			<my-shouldnotrender rendered="true">
				<div>
					<span>Im already rendered</span>
				</div>
			</my-shouldnotrender>
		`.removeGutter());

		await delay(10);

		$('my-shouldnotrender').get(0).outerHTML.removeGutter().should.equal(`
			<my-shouldnotrender rendered="true">
				<div>
					<span>Im already rendered</span>
				</div>
			</my-shouldnotrender>
		`.removeGutter());

		// cleanup
		$('my-shouldnotrender').remove();

		done();

		})();

	});

	it('render slot component', (done) => {

		(async () => {

		@view(`
			<div class="a"></div>
			<div class="b"></div>
			<div class="c">
				<span><slot></slot></span>
			</div>
		`)
		@component({
			name: 'my-innercomponent'
		})
		class MyInnerComponent {}

		$('body').append('<my-innercomponent>Im inner of MyInnerComponent</my-innercomponent>');

		await delay(10);

		$('my-innercomponent').get(0).outerHTML.removeGutter().should.equal(`
			<my-innercomponent rendered="true">
				<div class="a"></div>
				<div class="b"></div>
				<div class="c">
					<span><slot>Im inner of MyInnerComponent</slot></span>
				</div>
			</my-innercomponent>
		`.removeGutter());

		// cleanup
		$('my-innercomponent').remove();

		done();

		})();

	});

	it('render compontents only once on nested component', done => {

		(async () => {

		@view(`
			<div class="x"></div>
			<div class="y"></div>
			<div class="z">
				<span><slot></slot></span>
			</div>
		`)
		@component({
			name: 'my-quxust',
		})
		class MyQuxust {

			created(){}
			@on(EVENT_VIEW_RENDER) viewRendered(){}

		}

		@view(`
			<ul>
				<li> One </li>
				<li> Two </li>
				<li>
					<slot></slot>
				</li>
			</ul>
		`)
		@component({
			name: 'my-specical-com',
		})
		class MySpecialCom {

			created(){}
			@on(EVENT_VIEW_RENDER) viewRendered(){}

		}

		@view('<p>im template, im appened</p>')
		@component({
			name: 'my-awesome-com',
		})
		class MyAwesomeCom {

			created(){}
			@on(EVENT_VIEW_RENDER) viewRendered(){}

		}

		/**************************
		 ********* Setup **********
		 **************************/

		// spy events
		let [ MyQuxust_events ] = storage.get(MyQuxust).get('@on').get('events').get('local');
		let [ MySpecialCom_events ] = storage.get(MySpecialCom).get('@on').get('events').get('local');
		let [ MyAwesomeCom_events ] = storage.get(MyAwesomeCom).get('@on').get('events').get('local');

		let spy_myQuxust = sinon.spy(MyQuxust_events, 1);
		let spy_mySpecialCom = sinon.spy(MySpecialCom_events, 1);
		let spy_myAwesomeCom = sinon.spy(MyAwesomeCom_events, 1);

		// spy created
		let spy_myQuxust_created = sinon.spy(MyQuxust.prototype, "created");
		let spy_mySpecialCom_created = sinon.spy(MySpecialCom.prototype, "created");
		let spy_myAwesomeCom_created = sinon.spy(MyAwesomeCom.prototype, "created");

		$('body').append(`
			<my-quxust>
				<my-specical-com>
					<my-awesome-com>
						<span>i have not slot</span>
					</my-awesome-com>
				</my-specical-com>
			</my-quxust>
		`);

		await delay(10);

		let markup = `
			<my-quxust rendered="true">
				<div class="x"></div>
				<div class="y"></div>
				<div class="z">
					<span>
						<slot>
							<my-specical-com rendered="true">
								<ul>
									<li> One </li>
									<li> Two </li>
									<li>
										<slot>
											<my-awesome-com rendered="true">
												<span>i have not slot</span>
												<p>im template, im appened</p>
											</my-awesome-com>
										</slot>
									</li>
								</ul>
							</my-specical-com>
						</slot>
					</span>
				</div>
			</my-quxust>
		`.removeGutter();

		// should render expected template
		let myQuxstNode = $('my-quxust').get(0);
		myQuxstNode.outerHTML.removeGutter().should.equal(markup);

		// should call rendered callback only once
		spy_myQuxust.callCount.should.be.equal(1);
		spy_mySpecialCom.callCount.should.be.equal(1);
		spy_myAwesomeCom.callCount.should.be.equal(1);

		// should call created callback only once
		spy_myQuxust_created.callCount.should.be.equal(1);
		spy_mySpecialCom_created.callCount.should.be.equal(1);
		spy_myAwesomeCom_created.callCount.should.be.equal(1);

		$('my-quxust').remove();
		$('body').append(myQuxstNode);

		await delay(10);

		// should call rendered callback only once
		spy_myQuxust.callCount.should.be.equal(1);
		spy_mySpecialCom.callCount.should.be.equal(1);
		spy_myAwesomeCom.callCount.should.be.equal(1);

		// should call created callback only once
		spy_myQuxust_created.callCount.should.be.equal(1);
		spy_mySpecialCom_created.callCount.should.be.equal(1);
		spy_myAwesomeCom_created.callCount.should.be.equal(1);

		// Cleanup
		MyQuxust_events[1].restore();
		MySpecialCom_events[1].restore();
		MyAwesomeCom_events[1].restore();

		MyQuxust.prototype.created.restore();
		MySpecialCom.prototype.created.restore();
		MyAwesomeCom.prototype.created.restore();

		done();

		})();

	});

});
