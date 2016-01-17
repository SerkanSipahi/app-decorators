
// internal libs
import Eventhandler from 'src/libs/eventhandler';

// external libs
import sinon from 'sinon';

describe('Eventhandler Class', () => {

	describe('Eventhandler.prepareEventDomain', () => {

		it('should prepare eventDomain string into event and delegateSelector', () => {

			Eventhandler.prepareEventdomain('click').should.containDeep(['click', null]);;
			Eventhandler.prepareEventdomain('dbclick .abc').should.containDeep(['dbclick', '.abc']);;
			Eventhandler.prepareEventdomain('mouseup .abc .def').should.containDeep(['mouseup', '.abc .def']);

		});

	});

	// generic functions
	let foo = function foo(){};
	let bar = function bar(){};
	let baz = function baz(){};
	let boo = function boo(){};
	let koo = function koo(){};
	let naz = function naz(){};

	describe('Evenhandler.prototype._get', () => {

		it('should return callback/s by given event', () => {

			let eventHandler = Eventhandler.create({
				events : {
					"a .foo": foo,
					"a .bar": bar,
					"b .baz": baz,
					"b .boo": boo,
					"c .koo": koo,
					"d"     : naz,
				},
				element: document.createElement("div"),
			});

			// test
			eventHandler._get('a').should.have.length(2);
			eventHandler._get('b').should.have.length(2);
			eventHandler._get('c').should.have.length(1);

		});

	});

	describe('Evenhandler.groupEvents', () => {

		it('should groupby event type', () => {

			let passedObject = {
				"click .foo"  : foo,
				"mouseup .boo": boo,
				"click .bar"  : bar,
				"mouseup .koo": koo,
				"click .baz"  : baz,
				"mousedown"   : naz,
			}

		   /**
			* #### Excepted grouped object ####
			*
			* groupedObject {
			* 	"click" : [
			* 		{ ".foo": function foo(){} },
			* 		{ ".bar": function bar(){} },
			* 	],
			* 	"mouseup": [
			* 		{ ".boo": function foo(){} },
			* 		{ ".koo": function koo(){} },
			* 	],
			* 	"mousedown": [
			* 		{ null:  naz},
			* 		{ null:  laz},
			* 	],
			* }
			**/

			// group events
			let groupedObject = Eventhandler.groupEvents(passedObject);
			// tests click group
			groupedObject.should.have.propertyByPath("click", 0, ".foo").eql(foo);
			groupedObject.should.have.propertyByPath("click", 1, ".bar").eql(bar);
			groupedObject.should.have.propertyByPath("click", 2, ".baz").eql(baz);
			// tests mouseup group
			groupedObject.should.have.propertyByPath("mouseup", 0, ".boo").eql(boo);
			groupedObject.should.have.propertyByPath("mouseup", 1, ".koo").eql(koo);
			// test without delegateSelector
			groupedObject.should.have.propertyByPath("mousedown", 0, null).equal(naz)

		});

	});

	describe('Eventhandler.create()', () => {

		let clickFoo = function() {};
		let mouseupBoo = function() {};
		let clickBar = function() { this.someMethod(); };
		let mouseupKoo = function() {};
		let clickBaz = function() {};
		let mouseDown = function() {};

		let element = document.createElement('div');
		let bindObject = {
			someMethod : function(){},
		};

		let clickCallbacks = null;

		beforeEach(() => {

			element = document.createElement("div");
			element.innerHTML = `
				<!-- onClick  -->
				<div class="foo">Foo</div>
				<div class="bar">Bar</div>
				<div class="baz">Baz</div>
				<!-- onMouseup -->
				<div class="boo">Boo</div>
				<div class="koo">Koo</div>
			`;
			document.body.appendChild(element);

		});

		afterEach(() => {
			document.body.removeChild(element);
		});

		it('should trigger events', () => {

			let eventHandler = Eventhandler.create({
				events : {
					"click .foo"  : clickFoo,
					"click .bar"  : clickBar,
					"click .baz"  : clickBaz,
					"mouseup .boo": mouseupBoo,
					"mouseup .koo": mouseupKoo,
					"mousedown"   : mouseDown,
				},
				element: element,
				bind: bindObject,
			});

			// setup tests (spying)
			// test click
			clickCallbacks = eventHandler._get('click');
			sinon.spy(clickCallbacks[0], ".foo");
			sinon.spy(clickCallbacks[1], ".bar");
			sinon.spy(clickCallbacks[2], ".baz");
			sinon.spy(bindObject, "someMethod");

			// test click event
			element.querySelector('.baz').click();
			clickCallbacks[0][".foo"].callCount.should.eql(0);
			clickCallbacks[1][".bar"].callCount.should.eql(0);
			clickCallbacks[2][".baz"].callCount.should.eql(1);

			element.querySelector('.foo').click();
			clickCallbacks[0][".foo"].callCount.should.eql(1);
			clickCallbacks[1][".bar"].callCount.should.eql(0);
			clickCallbacks[2][".baz"].callCount.should.eql(1);

			element.querySelector('.bar').click();
			clickCallbacks[0][".foo"].callCount.should.eql(1);
			clickCallbacks[1][".bar"].callCount.should.eql(1);
			clickCallbacks[2][".baz"].callCount.should.eql(1);

			// test bind object
			bindObject.someMethod.callCount.should.eql(1);

			/**
			 * INFO to the test:
			 * except click all other native events can not be easily simulated.
			 * Mouseup, Mousedown was tested manually.
			 */

			// reset spyies
			clickCallbacks[0][".foo"].restore();
			clickCallbacks[1][".bar"].restore();
			clickCallbacks[2][".baz"].restore();

		});

	});

});
