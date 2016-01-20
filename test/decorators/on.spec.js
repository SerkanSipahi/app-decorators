
import { component, view, on } from 'src/app-decorators';

describe('@on decorator', () => {

	describe('view.helper.registerNamespaces', () => {

		it('should create right namespace object', () => {

			on.helper.registerNamespaces({}).should.have.propertyByPath('$appDecorators', 'on', 'events');

		});

	});

	describe('@on decorator', () => {

		it('should build correct property path of Eventhandler.prototype.$appDecorators.on.events', () => {

			class Eventhandler {

				@on('click .a') onClick_a() {}
				@on('click .b .c') onClick_bc() {}

				@on('mouseup .d') onMouseup_d(){}
				@on('mouseup .e .f') onMouseup_ef(){}

				@on('mousedown') onMousedown(){}

			}

			let events = Eventhandler.prototype.$appDecorators.on.events;
			let prototype = Eventhandler.prototype;

			// test property paths of clicks
			events.should.have.propertyByPath("click .a").eql(prototype.onClick_a);
			events.should.have.propertyByPath("click .b .c").eql(prototype.onClick_bc);

			// test property paths of mouseup
			events.should.have.propertyByPath("mouseup .d").eql(prototype.onMouseup_d);
			events.should.have.propertyByPath("mouseup .e .f").eql(prototype.onMouseup_ef);

			// test property paths of onMousedown
			events.should.have.propertyByPath("mousedown").eql(prototype.onMousedown);

		});

	});

});
