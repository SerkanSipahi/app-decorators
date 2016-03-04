
// internal libs
import Router from 'src/libs/router';


describe('Class Router', () => {

	it('should throw an error if passed object is not an object', () => {

		(() => { Router.create().should.throw('Passed Object must be an object {}')});

	});

	it.skip('just an idea', () => {

		let router = Router.create({
			routes : {
				'product::detail': {
					'/product/detail/{{ id }}' : () => {

					}
				},
				'product::site': {
					'/product/detail/{{ id }}?foo={{ a }}&bar={{ b }}#baz={{ c }}': ({ id, b, c }) => {

					}
				}
			}
		});

		router.on('product::detail', '/product/detail/{{ id }}', ({ id }) => {

		});

		router.on('product::site', '/product/detail/{{ id }}?foo={{ a }}&bar={{ b }}#baz={{ c }}', ({ id, b, c }) => {

		});

		router.on('checkout::login', /.*?thats={{ it }}:*/, ({ it }) => {

		});

		router.on('checkout::login', /.*logout(?:token=([0-9])+)?/, ([ number ]) => {

		});

	});

});
