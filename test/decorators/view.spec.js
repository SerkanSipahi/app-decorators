
// internal libs
import { component, view, on } from 'src/app-decorators';

// external libs
import $ from 'jquery';

// init special innerHTML for test
String.prototype.removeGutter = function(){
	return this.replace(/[\t\n\r]/gm, '');
};

describe('@view decorator', () => {

	describe('in usage with @  (integration-test)', () => {

		beforeEach(() =>
	      	$('body').append('<div id="view-decorator"></div>')
	    );

		afterEach(() =>
	  		$('#view-decorator').remove()
		);

		// decorate
		@view(`<span>{{n}}</span><p>{{p}}</p>`)
		@component()
		class serkan {
			@view.bind n = 'Hello';
			@view.bind p = 'World';
		}

		it('should also create a element if element created from out of dom', (done) => {


			// First test
			let $vc = $('#view-decorator');
			$vc.append(`
				<com-serkan id="serkan-1"></com-serkan>
				<com-serkan id="serkan-2"></com-serkan>
			`);

			let $serkan1 = $vc.find('com-serkan#serkan-1');
			let $serkan2 = $vc.find('com-serkan#serkan-2');

			// setTimeout is required for browsers that use the customelement polyfill (onyl for test)
			setTimeout(() => {

				// Test-1: check if rendered
				$serkan1.attr('rendered').should.be.equal('true');
				$serkan1.html().should.be.equal('<span>Hello</span><p>World</p>');

				// Test-2: check if rendered
				$serkan2.attr('rendered').should.be.equal('true');
				$serkan2.html().should.be.equal('<span>Hello</span><p>World</p>');

				// Test-3: check if rendered on write view.bind attri
				$serkan1.get(0).p = 'Mars';
				$serkan2.get(0).p = 'Pluto';

				$serkan1.html().should.be.equal('<span>Hello</span><p>Mars</p>');
				$serkan2.html().should.be.equal('<span>Hello</span><p>Pluto</p>');

				done();

			}, 50);

		});

		it('should also create a element if element with view vars although created from out of dom', (done) => {

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

			// setTimeout is required for browsers that use the customelement polyfill (onyl for test)
			setTimeout(() => {

				$fire1.attr('rendered').should.equal('true');
				$fire1.html().should.equal('<span>id-1.)<b>First</b>Thats</span><p>awesome!</p>');

				$fire2.attr('rendered').should.equal('true');
				$fire2.html().should.equal('<span>id-2.)<b>Second</b>Whats</span><p>up!</p>');

				$fire1.get(0).c = 'on!';
				$fire2.get(0).c = 'waw!';

				$fire1.html().should.equal('<span>id-1.)<b>First</b>Thats</span><p>on!</p>');
				$fire2.html().should.equal('<span>id-2.)<b>Second</b>Whats</span><p>waw!</p>');

				done();

			}, 0);

		});

		it('should render template if call domNode.render directly or over domNode.$.view.render', (done) => {

			let $vc = $('#view-decorator');
			$vc.append(`<com-serkan></com-serkan>`);

			// setTimeout is required for browsers that use the customelement polyfill (onyl for test)
			setTimeout(() => {

				$vc.find('com-serkan').get(0).render({n: 'Cool', p: 'man!'}, { force: true });
				$vc.find('com-serkan').get(0).outerHTML.should.equal('<com-serkan rendered="true"><span>Cool</span><p>man!</p></com-serkan>');

				$vc.find('com-serkan').get(0).$view.render({n: 'Hey', p: 'there!'}, { force: true });
				$vc.find('com-serkan').get(0).outerHTML.should.equal('<com-serkan rendered="true"><span>Hey</span><p>there!</p></com-serkan>');

				done();

			}, 100);

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

		it('should not render phone because is not part of @view.bind', () => {

			let orange_0 = Orange.create();
			orange_0.$view._template['test-tpl'] = '<div>{{name}}</div><div>{{city}}</div><div>{{country}}</div>{{phone}}';
			orange_0.$view.render({}, 'test-tpl');
			orange_0.outerHTML.should.equal('<com-orange rendered="true"><div>A-Df</div><div>B-Df</div><div>C-Df</div></com-orange>');

		});

	});

	it('should not render because rendered flag is set', (done) => {

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

		// setTimeout is required for browsers that use the customelement polyfill (onyl for test)
		setTimeout(() => {

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

		}, 10);

	});

	it('render slot component', (done) => {

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

		// setTimeout is required for browsers that use the customelement polyfill (onyl for test)
		setTimeout(() => {

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

		}, 10);

	});

	it('render compontents only once on nested component', (done) => {

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
			@on('view-rendered') viewRendered(){}
			@on('view-already-rendered') viewAlreadyRendered(){}

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
			@on('view-rendered') viewRendered(){}
			@on('view-already-rendered') viewAlreadyRendered(){}

		}

		@view('<p>im template, im appened</p>')
		@component({
			name: 'my-awesome-com',
		})
		class MyAwesomeCom {

			created(){}
			@on('view-rendered') viewRendered(){}
			@on('view-already-rendered') viewAlreadyRendered(){}

		}

		/*
		// setup spies
		let spy_createdMyQuxust = sinon.spy(MyQuxust.prototype, "created");
		let spy_createdMySpecialCom = sinon.spy(MySpecialCom.prototype, "created");
		let spy_createdMyAwesomeCom = sinon.spy(MyAwesomeCom.prototype, "created");

		let spy_viewRenderedMyQuxust = sinon.spy(MyQuxust.prototype.$.config.on.events.local, "view-rendered");
		let spy_viewRenderedMySpecialCom = sinon.spy(MySpecialCom.prototype.$.config.on.events.local, "view-rendered");
		let spy_viewRenderedMyAwesomeCom = sinon.spy(MyAwesomeCom.prototype.$.config.on.events.local, "view-rendered");

		let spy_viewAlreadyRenderedMyQuxust = sinon.spy(MyQuxust.prototype.$.config.on.events.local, "view-already-rendered");
		let spy_viewAlreadyRenderedMySpecialCom = sinon.spy(MySpecialCom.prototype.$.config.on.events.local, "view-already-rendered");
		let spy_viewAlreadyRenderedMyAwesomeCom = sinon.spy(MyAwesomeCom.prototype.$.config.on.events.local, "view-already-rendered");
		*/

		// setup nested components
		$('body').append(`
			<my-quxust>
				<my-specical-com>
					<my-awesome-com>
						<span>i have not slot</span>
					</my-awesome-com>
				</my-specical-com>
			</my-quxust>
		`);

		// setTimeout is required for browsers that use the customelement polyfill (onyl for test)
		setTimeout(() => {

			// test
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

			$('my-quxust').get(0).outerHTML.removeGutter().should.equal(markup);

			done();

			/*
			// created should call only once
			spy_createdMyQuxust.callCount.should.equal(1);
			spy_createdMySpecialCom.callCount.should.equal(1);
			spy_createdMyAwesomeCom.callCount.should.equal(1);

			// view-rendered should trigger only once
			spy_viewRenderedMyQuxust.callCount.should.equal(1);
			spy_viewRenderedMySpecialCom.callCount.should.equal(1);
			spy_viewRenderedMyAwesomeCom.callCount.should.equal(1);

			spy_viewAlreadyRenderedMyQuxust.callCount.should.equal(0);
			spy_viewAlreadyRenderedMySpecialCom.callCount.should.equal(0);
			spy_viewAlreadyRenderedMyAwesomeCom.callCount.should.equal(0);

			$('my-quxust').remove();
			$('body').append(markup);

			// setTimeout is required for browsers that use the customelement polyfill (onyl for test)
			setTimeout(() => {

				// created should call only once
				spy_createdMyQuxust.callCount.should.equal(2);
				spy_createdMySpecialCom.callCount.should.equal(2);
				spy_createdMyAwesomeCom.callCount.should.equal(2);

				// view-rendered should trigger only once
				spy_viewRenderedMyQuxust.callCount.should.equal(1);
				spy_viewRenderedMySpecialCom.callCount.should.equal(1);
				spy_viewRenderedMyAwesomeCom.callCount.should.equal(1);

				spy_viewAlreadyRenderedMyQuxust.callCount.should.equal(1);
				spy_viewAlreadyRenderedMySpecialCom.callCount.should.equal(1);
				spy_viewAlreadyRenderedMyAwesomeCom.callCount.should.equal(1);


				//cleanup
				spy_createdMyQuxust.restore();
				spy_createdMySpecialCom.restore();
				spy_createdMyAwesomeCom.restore();

				spy_viewRenderedMyQuxust.restore();
				spy_viewRenderedMySpecialCom.restore();
				spy_viewRenderedMyAwesomeCom.restore();

				spy_viewAlreadyRenderedMyQuxust.restore();
				spy_viewAlreadyRenderedMySpecialCom.restore();
				spy_viewAlreadyRenderedMyAwesomeCom.restore();

				done();

			}, 20);
			*/

		}, 20);

	});

});
