
// internal libs
import Router from 'src/apps/router';

describe('Class Router', () => {

	// http://stackoverflow.com/questions/25578112/spying-on-a-method-with-sinon-method-bound-to-event-listener-method-was-execut#25578185
	let spy_onUrlchange = sinon.spy(Router.prototype, "_onUrlchange");
	let router = router = Router.create();

	describe('prototype.resolveURL', () => {

		it('should return url object with additional "fragment" property', () => {

			let url = router.resolveURL('http://www.mydomain.com/path/to/somewhere.html?a=1&b=2');
			url.fragment.should.equal('/path/to/somewhere.html?a=1&b=2');

		});

	});

	describe('prototype.createPromise', () => {

		it('should return promise object', () => {

			router.createPromise(function(){}).should.be.Promise();

		});

	});

	describe('static create', () => {

		it('should throw an error if any passed argument missing', () => {

			(function(){ router.on() }).should.throw();
			(function(){ router.on('urlchange') }).should.throw();
			(function(){ router.on('my route', '/a/b/c') }).should.throw();

		});

		it('should return promise if passed arguments passed rightly', () => {

			router.on('a', '/product/detail/{{ id }}', ({ id }) => {}).should.be.Promise();
			router.on('urlchange', (event) => {}).then((event)  => {}).should.be.Promise();

		});

		it('should return promise if passed arguments passed rightly', () => {

			let element = null;
			element = document.createElement("div");
			element.classList.add('anchor-container');
			element.innerHTML = `
				<a class="foo" href="/index"> Index </a>
				<a class="bar" href="/index/details"> Details </a>
				<a class="baz" href="/index/details?a=1&b=2"> Params </a>
				<a class="qux" href="/index/details?a=1&b=2#c=3;d=4"> Params </a>
			`;

			document.body.appendChild(element);

			// run test
			element.querySelector('.foo').click(); spy_onUrlchange.callCount.should.equal(1);
			element.querySelector('.bar').click(); spy_onUrlchange.callCount.should.equal(2);
			element.querySelector('.baz').click(); spy_onUrlchange.callCount.should.equal(3);
			element.querySelector('.qux').click(); spy_onUrlchange.callCount.should.equal(4);
			element.querySelector('.qux').click(); spy_onUrlchange.callCount.should.equal(4);

			// test popstate
			// chrome: with karma + mocha is does not work (.back/forward)!
			// Dont know why!? I have tested for Chrome manually and its works
			router.back();
			router.back();
			router.back();

			// cleanup
			document.body.removeChild(element);
			router._onUrlchange.restore();

		});

	});

});
