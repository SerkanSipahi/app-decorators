
import Eventhandler from 'src/libs/eventhandler';

describe('Eventhandler Class', () => {

	describe('Eventhandler.prepareEventDomain', () => {

		it('should prepare eventDomain string into event and delegateSelector', () => {

			Eventhandler.prepareEventdomain('click').should.containDeep(['click', undefined]);;
			Eventhandler.prepareEventdomain('dbclick .abc').should.containDeep(['dbclick', '.abc']);;
			Eventhandler.prepareEventdomain('mouseup .abc .def').should.containDeep(['mouseup', '.abc .def']);

		});

	});

	describe('Eventhandler.create()', () => {

		let onClick = function onClick(){};
		let onMouseupFoo = function onMouseupFoo(){};
		let onKeyupFooBar = function onKeyupFooBar(){};

		let element = document.createElement("div");
		let bindObject = { foo: 'bar' };

		element.innerHTML = `
			<div class="foo">Foo</div>
			<div class="bar">
				<div class="baz">Baz</div>
			</div>
		`;

		it('should create an instance with passed config', () => {

			let eventHandler = Eventhandler.create({
				events : {
					"click": onClick,
					"mouseup .foo": onMouseupFoo,
					"keyup .bar .baz": onKeyupFooBar,
				},
				element: element,
				bind: bindObject,
			});

			// test event config
			eventHandler.config.events.should.have.propertyByPath("click").eql(onClick);
			eventHandler.config.events.should.have.propertyByPath("mouseup .foo").eql(onMouseupFoo);
			eventHandler.config.events.should.have.propertyByPath("keyup .bar .baz").eql(onKeyupFooBar);
			// test element config
			eventHandler.config.should.have.propertyByPath("element").eql(element);

		});

	});

});
