import { bootstrapPolyfills } from 'src/bootstrap';
import { isFirefox } from 'src/helpers/browser-detect';
import { removeGutter } from 'src/helpers/string';
import { delay } from 'src/helpers/delay';

import sinon from 'sinon';

describe('@on decorator', async () => {

	await bootstrapPolyfills;
	let { component, view, on, storage } = await System.import('app-decorators');

	describe('@on decorator', () => {

		it('should call customElements hooks in right order', done => {

			(async () => {

			@component({
				name: 'right-order-on',
			})
			class RightOrderOn {
				@on('click .foo') onClickFoo(){

				}
			}

			/**
			 *  Setup
			 */

			$('body').append('<div class="test-right-on"></div>');

			let createdCallback  = storage.get(RightOrderOn).get('@callbacks').get('created');
			let attachedCallback = storage.get(RightOrderOn).get('@callbacks').get('attached');
			let detachedCallback = storage.get(RightOrderOn).get('@callbacks').get('detached');

			let spy_rightOrder_created  = sinon.spy(createdCallback,  0);
			let spy_rightOrder_attached = sinon.spy(attachedCallback, 0);
			let spy_rightOrder_detached = sinon.spy(detachedCallback, 0);

			let rightOrderOn = RightOrderOn.create();
			$('.test-right-on').append(rightOrderOn);
			$('.test-right-on right-order-on').remove();
			$('.test-right-on').append(rightOrderOn);

			await delay(1);

			/**
			 *  Test
			 */

			spy_rightOrder_created.callCount.should.be.equal(1);
			spy_rightOrder_attached.callCount.should.be.equal(2);
			spy_rightOrder_detached.callCount.should.be.equal(1);

			// cleanup
			createdCallback[0].restore();
			attachedCallback[0].restore();
			detachedCallback[0].restore();
			$('.test-right-on').remove();

			done();

			})();

		});

	});

	describe('Snack events', function() {

		it('should contain registered events over @on', () => {

			class Snack {
				// local scope
				@on('click .a') onClick_a() {}
				@on('click .b') onClick_b() {}
				// custom scope (window)
				@on('resize', window) onResize(){}
				@on('wheel', window) onWheel(){}
			}

			let prototype = Snack.prototype;
			let localEvents = storage.get(Snack).get('@on').get('events').get('local');
			let contextEvents = storage.get(Snack).get('@on').get('events').get('context');

			localEvents.should.have.propertyByPath(0, 1).equal(prototype.onClick_a);
			localEvents.should.have.propertyByPath(1, 1).equal(prototype.onClick_b);

			contextEvents.should.have.propertyByPath(0, 1, 0).equal(prototype.onResize);
			contextEvents.should.have.propertyByPath(0, 1, 1).equal(window);

			contextEvents.should.have.propertyByPath(1, 1, 0).eql(prototype.onWheel);
			contextEvents.should.have.propertyByPath(1, 1, 1).eql(window);

			localEvents.should.have.length(2);
			contextEvents.should.have.length(2);

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

		it('should test click when created and reinit (detached/attached) again', done => {

			(async () => {

			let clickCount = 0;
			let testDiv = document.createElement('div');
			testDiv.id = 'test-div';
			document.body.appendChild(testDiv);

			@view(`
				<div class="a"> A </div>
				<div class="b"> B </div>
			`)
			@component()
			class Burger {
				@on('click .a') onFoo_a() {
					clickCount++;
				}
			}

			// create instane
			let burger = Burger.create();
			testDiv.appendChild(burger);

			// test 1
			burger.querySelector('.a').click();
			should(clickCount).be.eql(1);

			// remove and test clicking
			$('com-burger').remove();
			await delay(10);

			burger.querySelector('.a').click();
			should(clickCount).be.eql(1);

			// append again
			testDiv.appendChild(burger);
			await delay(10);

			burger.querySelector('.a').click();
			should(clickCount).be.eql(2);

			done()

			})()
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
			let context_resize_Callbacks = context.$eventHandler['resize_window_onResize'].getHandlers('resize');
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
