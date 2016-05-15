
// internal libs
import { component, view, on } from 'src/app-decorators';

// external libs
import sinon from 'sinon';

let isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;

// init special innerHTML for test
String.prototype.removeGutter = function(){
	return this.replace(/[\t\n\r]/gm, '');
}

describe('@on decorator', () => {

	describe('view.helper.registerNamespaces', () => {

		it('should create namespace object´s', () => {

			on.helper.registerNamespaces({}).should.have.containEql({
				$appDecorators: { on: { events: {} } },
				$onCreated:  { on: [] },
				$onAttached: { on: [] },
				$onDetached: { on: [] },
			});

		});

	});

	describe('view.helper', () => {

		// Mock target
		let mockTarget = {
			$appDecorators: {
				on: { events: { 'some-event' : () => {} } }
			},
			$onCreated: {
				on: []
			}
		};
		let mockFunction = function(){}

		describe('registerEvent', () => {

			it('should throw an error because eventtype already exists', () => {

				(function(){
					on.helper.registerEvent(mockTarget, 'some-event', function(){})
				}).should.throw('The Event: "some-event" already exists!');

			});

			it('should build event object based on registered namespaces', () => {

				let result = on.helper.registerEvent(mockTarget, 'some-other-event', mockFunction);
				result.should.have.propertyByPath('$appDecorators', 'on', 'events', 'some-other-event').equal(mockFunction);

			});

		});

		describe('registerCallback', () => {

			it('should add callback based on registered namespaces', () => {

				let result = on.helper.registerCallback('created', mockTarget, mockFunction);
				result.should.have.propertyByPath('$onCreated', 'on', 0).equal(mockFunction);

			});

		});

	});

	describe('Snack.prototype.$appDecorators.on.events', () => {

		it('should contain registered events over @on', () => {

			class Snack {
				@on('click .a') onClick_a() {}
				@on('click .b') onClick_b() {}
			}

			let events = Snack.prototype.$appDecorators.on.events;
			let prototype = Snack.prototype;

			events.should.have.propertyByPath("click .a").eql(prototype.onClick_a);
			events.should.have.propertyByPath("click .b").eql(prototype.onClick_b);

			Object.keys(events).should.have.length(2);

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
			let milkey_1_clickCallbacks = milkey_1.$.eventHandler.getHandlers('click');
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

			// test 4
			milkey_1_a_function_spy.restore();
			milkey_1_b_function_spy.restore();

		});

		it('it should ensure that eventhandler has right context', () => {

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

	});

});
