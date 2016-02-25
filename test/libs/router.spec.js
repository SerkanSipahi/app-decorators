
// internal libs
import Router from 'src/libs/router';


describe('Class Router', () => {

	it('should throw an error if passed object is not an object', () => {

		(() => { Router.create().should.throw('Passed Object must be an object {}')});

	});

});
