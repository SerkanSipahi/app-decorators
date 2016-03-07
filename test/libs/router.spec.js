
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

	describe('on created new instance', () => {

		let element = null;

		beforeEach(() => {

			element = document.createElement("div");
			element.classList.add('anchor-container');
			element.innerHTML = `
				<a class="foo" href="/index"> Index </a>
				<a class="bar" href="/index/details"> Details </a>
				<a class="baz" href="/index/details?a=1&b=2"> Params </a>
				<a class="qux" href="/index/details?a=1&b=2#c=3;d=4"> Params </a>
			`;
			document.body.appendChild(element);

		});

		afterEach(() => {
			document.body.removeChild(element);
		});

		it('should trigger "urlchange" on pushState or on click of an a-link', () => {

			// setup
			let count = 0;
			let fragment = null;
			let router = Router.create({
				config: {
					Eventhandler,
				}
			});
			sinon.spy(router, '_onUrlchange');
			router.onUrlchange( event => {
				fragment = event.detail.fragment;
				++count;
			});
			// TODO: implment it with promise
			// router.on('urlchange').then((event) => {
			//
			// });

			// run test
			element.querySelector('.foo').click();
			count.should.equal(1);
			element.querySelector('.bar').click();
			count.should.equal(2);
			element.querySelector('.baz').click();
			count.should.equal(3);

			element.querySelector('.qux').click();
			count.should.equal(4);
			element.querySelector('.qux').click();
			count.should.equal(4);

			// test popstate
			// TODO: in chrome router.back() does not work
			router.back();
			router.back();
			router.back();

			// cleanup
			// TODO: cleanup failed
			// router.destroy(); FAILED

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

		router.addRoute('product::detail', '/product/detail/{{ id }}').then(({ id }) => {

		});

		router.addRoute('product::site', '/product/detail/{{ id }}?foo={{ a }}&bar={{ b }}#baz={{ c }}').then(({ id, a, b, c }) => {

		});

		router.addRoute('checkout::login', /.*?thats={{ awesome }}:*/).then(({ awesome }) => {

		});

		async function chckout_login(){

			// 'checkout::login' can forwarding to some service (see thirt ar
			let invoice = await router.addRoute('checkout::login', /.*logout(?:token=([0-9])+)?/, 'http://www.mydomain/cat/document/1');

			// do something
			// ...
			// ...

			router.addRoute('checkout::login', '/login/user/{{ name }/messages/{{ id }}').then(({ name, messages }) => {

			});

		};

	});

});
