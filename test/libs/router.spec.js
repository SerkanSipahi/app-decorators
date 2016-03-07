
// internal libs
import Router from 'src/libs/router';
import Eventhandler from 'src/libs/eventhandler';

describe('Class Router', () => {

	describe('static newUrl() method', () => {

		it('should return url object with fragment property', () => {

			let url = Router.newUrl('http://www.mydomain.com/path/to/somewhere.html?a=1&b=2');
			url.fragment.should.equal('/path/to/somewhere.html?a=1&b=2');

		});

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
