
// internal libs
import { component, view, on } from 'src/app-decorators';
import { isFirefox, isSafari } from 'src/helpers/browser-detect';
import { removeGutter } from 'src/helpers/string';

// external libs
import sinon from 'sinon';

describe('@on decorator', () => {


	describe('view.helper.registerNamespaces', () => {

		it('should create namespace object´s', () => {

			on.helper.registerNamespaces({}).should.be.containEql({
				$: { config: { on: {
						events: {
							local: {}
						},
						component: {
							created: [],
							attached: [],
							detached: [],
						},
					}}},
			});

		});

	});

	describe('view.helper', () => {

		let mockFunction1, mockFunction2, mockFunction3;
		let mockTarget;

		beforeEach(function() {

			mockFunction1 = function(){};
			mockFunction2 = function(){};
			mockFunction3 = function(){};

			mockTarget = {
				$: {
					config: {
						on: {
							events: {
								local: {}
							},
							component: {
								created: [],
								attached: [],
								detached: [],
							},
						},
					},
				},
			};

			// immutable mockTarget for each it
			mockTarget = JSON.parse(JSON.stringify(mockTarget))

		});

		describe('registerEvent', () => {

			it('should build config for local event', () => {

				on.helper.registerEvent(mockTarget, 'some-event-1', mockFunction1).should.have.propertyByPath(
					'$', 'config', 'on', 'events', 'local', 'some-event-1'
				).equal(mockFunction1);

			});

			it.skip('should build config for overwritten listenerElement', () => {

				on.helper.registerEvent(mockTarget, 'some-event-2', mockFunction2, window).should.have.propertyByPath(
					'$', 'config', 'on', 'events', '[object Window]', 'some-event-2'
				).containEql([ mockFunction2, window ]);

			});

		});

		describe('registerCallback method', () => {

			it('should add register callback based', () => {

				on.helper.registerCallback('created', mockTarget, mockFunction1).should.have.propertyByPath(
					'$', 'config', 'on', 'component', 'created', '0'
				).equal(mockFunction1);

			});

			it('should add register callback based', () => {

				on.helper.registerCallback('attached', mockTarget, mockFunction2).should.have.propertyByPath(
					'$', 'config', 'on', 'component', 'attached', '0'
				).equal(mockFunction2);

			});

			it('should add register callback based', () => {

				on.helper.registerCallback('detached', mockTarget, mockFunction3).should.have.propertyByPath(
					'$', 'config', 'on', 'component', 'detached', '0'
				).equal(mockFunction3);

			});

		});

		describe('applyOnCreatedCallback', () => {

		})

	});

	describe('Snack.prototype.$.config.on.events', () => {

		it('should contain registered events over @on', () => {

			class Snack {
				// local scope
				@on('click .a') onClick_a() {}
				@on('click .b') onClick_b() {}
				// custom scope (window)
				@on('resize', window) onResize(){}
				@on('wheel', window) onWheel(){}
			}

			let localEvents = Snack.prototype.$.config.on.events.local;
			let windowEvents = Snack.prototype.$.config.on.events[window];
			let prototype = Snack.prototype;

			localEvents.should.have.propertyByPath("click .a").equal(prototype.onClick_a);
			localEvents.should.have.propertyByPath("click .b").equal(prototype.onClick_b);

			windowEvents.should.have.propertyByPath("resize", 0).equal(prototype.onResize);
			windowEvents.should.have.propertyByPath("resize", 1).equal(window);

			windowEvents.should.have.propertyByPath("wheel", 0).eql(prototype.onWheel);
			windowEvents.should.have.propertyByPath("wheel", 1).eql(window);

			Object.keys(localEvents).should.have.length(2);
			Object.keys(windowEvents).should.have.length(2);

		});

		it('should trigger correct method if clicked', () => {

			@view(`
				<div class="a"> A </div>
				<div class="b"> B </div>
			`)
			@component()
			class Milkey {
				@on('click .a') onFoo_a() {}
				@on('click .b') onBar_b() {}
			}

			// create instane
			let milkey_1 = Milkey.create({cid: 1});

			// spy for milkey_1
			let milkey_1_clickCallbacks = milkey_1.$eventHandler.local.getHandlers('click');
			let milkey_1_a_function_spy = sinon.spy(milkey_1_clickCallbacks[0], ".a");
			let milkey_1_b_function_spy = sinon.spy(milkey_1_clickCallbacks[1], ".b");

			// can simulate click on safari
			if(isSafari) {
				return;
			}

			// test 1
			milkey_1.querySelector('.a').click();
			milkey_1_a_function_spy.callCount.should.eql(1);
			milkey_1_b_function_spy.callCount.should.eql(0);

			// test 2
			milkey_1.querySelector('.b').click();
			milkey_1_a_function_spy.callCount.should.eql(1);
			milkey_1_b_function_spy.callCount.should.eql(1);

			// test 3
			milkey_1.querySelector('.a').click();
			milkey_1.querySelector('.b').click();
			milkey_1_a_function_spy.callCount.should.eql(2);
			milkey_1_b_function_spy.callCount.should.eql(2);

			// cleanup
			milkey_1_a_function_spy.restore();
			milkey_1_b_function_spy.restore();

		});

		it('should ensure that eventhandler has right context', () => {

			@view('<div class="a"> A </div>', { renderedFlag: false })
			@component()
			class Hanuta {
				cid = null;
				created({cid}){
					this.cid = cid;
				}
				@on('click .a') onFoo_a() {
					this.setAttribute('cid', this.cid);
				}
			}

			if(isSafari) {
				return;
			}

			//create instances
			let hanuta_1 = Hanuta.create({cid: 1});
			let hanuta_2 = Hanuta.create({cid: 2});

			// test 1
			hanuta_2.querySelector('.a').click();
			hanuta_2.outerHTML.should.be.equal('<com-hanuta cid="2"><div class="a"> A </div></com-hanuta>');
			hanuta_1.outerHTML.should.be.equal('<com-hanuta><div class="a"> A </div></com-hanuta>');

			// test 2
			hanuta_1.querySelector('.a').click();
			hanuta_1.outerHTML.should.be.equal('<com-hanuta cid="1"><div class="a"> A </div></com-hanuta>');
			hanuta_2.outerHTML.should.be.equal('<com-hanuta cid="2"><div class="a"> A </div></com-hanuta>');

		});

		it('should ensure that @on methods connected with base methods', () => {

			@view('<div class="a"> A </div>')
			@component()
			class Ritter {
				baseMethod(){
				}
				@on('click .a') onFoo_a() {
					this.baseMethod();
				}
			}

			if(isSafari) {
				return;
			}

			// create instane
			let ritter = Ritter.create();

			// spy for Ritter onFoo_a
			let ritter_clickCallbacks = ritter.$eventHandler.local.getHandlers('click');
			let ritter_function_spy = sinon.spy(ritter_clickCallbacks[0], ".a");
			// spy for Ritter baseMethod
			let ritter_baseMethod_spy = sinon.spy(Ritter.prototype, "baseMethod");

			//test
			ritter.querySelector('.a').click();
			ritter_function_spy.callCount.should.eql(1);
			ritter_baseMethod_spy.callCount.should.eql(1);

			// cleanup
			ritter_function_spy.restore();
			ritter_baseMethod_spy.restore();

		});

		it('should trigger window events but is instanec of Context and Element', () => {

			@view(`<div class="foo"></div>`)
			@component()
			class Context {

				@on('resize', window) onResize(event){
					this.callFoo();
					return this;
				}
				callFoo(){
					return this;
				}
				@on('click .foo') onClick(event){
					this.callFoo();
				}

			}

			let context = Context.create();

			let prefixName = Object.prototype.toString.call(window);
			let context_resize_Callbacks = context.$eventHandler[`${prefixName}_resize`].getHandlers('resize');
			let onResize = context_resize_Callbacks[0][null];

			document.body.appendChild(context);

			// test instanceof Context
			should(onResize() instanceof Context).be.true();
			should(context.callFoo() instanceof Context).be.true();

			// test instance Element
			should(onResize() instanceof Element).be.true();
			should(context.callFoo() instanceof Element).be.true();

			// spy for context resize
			let context_function_spy = sinon.spy(context_resize_Callbacks[0], null);
			let callFoo_function_spy = sinon.spy(Context.prototype, 'callFoo');

			// trigger resize
			let resizeEvent = new Event('resize');
			window.dispatchEvent(resizeEvent);

			// test
			context_function_spy.callCount.should.equal(1);
			callFoo_function_spy.callCount.should.equal(1);

			// test passed resize event object
			context_function_spy.args[0][0].type.should.equal('resize');
			should(context_function_spy.args[0][0] instanceof Event).be.true();
			if(!isFirefox){
				should(context_function_spy.args[0][0].currentTarget === window).be.true();
			}

			// test click event
			let context_clickCallbacks = context.$eventHandler.local.getHandlers('click');
			let context_click_function_spy = sinon.spy(context_clickCallbacks[0], ".foo");

			context.querySelector('.foo').click();
			context_click_function_spy.callCount.should.equal(1);
			callFoo_function_spy.callCount.should.equal(2);

			// test that have different instances and are not in context of window
			let context2 = Context.create();
			should(context2.onResize() === context2.callFoo()).be.true();
			should(context.onResize() === context2.onResize()).be.false();
			should(context.callFoo() === context2.callFoo()).be.false();

			// cleanup
			context_function_spy.restore();
			callFoo_function_spy.restore();
			context_click_function_spy.restore();

		});

	});

});
