
import { component, view, on } from 'src/app-decorators';

describe('@on decorator', () => {

	describe('view.helper.registerNamespaces', () => {

		it('should create right namespace object', () => {

			on.helper.registerNamespaces({}).should.have.propertyByPath('$appDecorators', 'on', 'events');

		});

	});

	describe('view.helper.prepareEventDomain', () => {

		it('should prepare eventDomain string into event and delegateSelector', () => {

			on.helper.prepareEventDomain('click').should.containDeep(['click', undefined]);;
			on.helper.prepareEventDomain('dbclick .abc').should.containDeep(['dbclick', '.abc']);;
			on.helper.prepareEventDomain('mouseup .abc .def').should.containDeep(['mouseup', '.abc .def']);

		});

	});

});
