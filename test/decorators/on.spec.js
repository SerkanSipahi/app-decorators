
import { component, view, on } from 'src/app-decorators';

describe('@on decorator', () => {

	describe('view.helper.registerNamespaces', () => {

		it('should create right namespace object', () => {

			on.helper.registerNamespaces({}).should.have.propertyByPath('$appDecorators', 'on', 'events');

		});

	});

});
