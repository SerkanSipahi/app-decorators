
// internal libs
import Router from 'src/apps/router';

describe('Class Router', () => {

	describe('prototype.resolveURL', () => {

		it('should return url object with additional "fragment" property', () => {

			// setup
			let router = router = Router.create({
				listener: document.createElement('div'),
			});
			// test
			let url = router.resolveURL('http://www.mydomain.com/path/to/somewhere.html?a=1&b=2');
			url.fragment.should.equal('/path/to/somewhere.html?a=1&b=2');
			// cleanup
			router.destroy();

		});

	});

	describe('prototype.createPromise', () => {

		it('should return promise object', () => {

			// setup
			let router = router = Router.create({
				listener: document.createElement('div'),
			});
			// test
			router.createPromise(function(){}).should.be.Promise();
			// cleanup
			router.destroy();

		});

	});

	describe('prototype.on', () => {

		it('should throw an error if no argeument passed', () => {

			// setup
			let router = router = Router.create({
				listener: document.createElement('div'),
			});
			// test
			(() => { router.on() }).should.throw();
			// cleanup
			router.destroy();

		});

		it('should throw an error if passed internal event wihout handler', () => {

			// setup
			let router = router = Router.create();
			// test
			(() => { router.on('urlchange') }).should.throw();
			// cleanup
			router.destroy();

		});

		it('should throw an error if passed not known event with handler', () => {

			// setup
			let router = router = Router.create({
				listener: document.createElement('div'),
			});
			// test
			(() => { router.on('someevent', () => {}) }).should.throw();
			// cleanup
			router.destroy();

		});

		it('should throw an error if passed routename + route but not handler', () => {

			// setup
			let router = router = Router.create({
				listener: document.createElement('div'),
			});
			// test
			(() => { router.on('my route', '/a/b/c') }).should.throw();
			// cleanup
			router.destroy();

		});

		it('should return promise if passed arguments passed correctly', () => {

			// setup
			let router = router = Router.create({
				listener: document.createElement('div'),
			});
			// test
			router.on('a', '/product/detail/{{ id }}', ({ id }) => {}).should.be.Promise();
			router.on('urlchange', (event) => {}).then((event)  => {}).should.be.Promise();
			// cleanup
			router.destroy();

		});

		it('should call "callback" if passed argument is internal event', () => {

			// setup
			let router = router = Router.create({
				listener: document.createElement('div'),
			});
			let spy_handler = sinon.spy();
			// test wihout trigger args
			router.on('urlchange', spy_handler);
			router.trigger('urlchange');
			spy_handler.callCount.should.equal(1);
			// test with trigger args
			router.trigger('urlchange', { hello: 'world' });
			spy_handler.callCount.should.equal(2);
			spy_handler.args[1][0].detail.should.propertyByPath('hello').eql('world');
			// cleanup
			router.destroy();

		});

		it('should call "then" if passed argument is internal event', () => {

		});

	});

	describe('click on anchor and by brower.back()', () => {

		it('should call handler _onUrlchange', () => {

			// setup
			// http://stackoverflow.com/questions/25578112/spying-on-a-method-with-sinon-method-bound-to-event-listener-method-was-execut#25578185
			let spy_onUrlchange = sinon.spy(Router.prototype, "_onUrlchange");
			let router = router = Router.create();

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
			router.destroy();

		});

	});

});
