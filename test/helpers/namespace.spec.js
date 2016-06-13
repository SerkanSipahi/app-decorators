
import { namespace } from '../../src/helpers/namespace';

describe('namespace', () => {

	describe('create method', () => {

		it('should create namespace object by passed target and namespace_string', () => {

			let target = {};
			target = namespace.create(target, 'a.b.c');
			target = namespace.create(target, 'a.b.d');

			target.should.have.propertyByPath('a', 'b', 'c');
			target.should.have.propertyByPath('a', 'b', 'd');

		});

		it('should create namespace object by passed target, namespace_string and add object', () => {

			let target = {};
			target = namespace.create(target, 'a.b.d', 1234);
			target = namespace.create(target, 'a.b.c', 5678);

			target.should.have.containEql({a:{b:{c: 5678, d: 1234 }}});

		});

	});

});
