
import Hello from 'src/hello';

describe('Hello', () => {

	it('says hello', () => {
		const hello = new Hello('World');
		true.should.equal(true);
	});

});
