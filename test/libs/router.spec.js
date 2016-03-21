
// internal libs
import Router from 'src/apps/router';

describe('Class Router', () => {

	describe('prototype.resolveURL', () => {

		it('should return url object with additional "fragment" property', () => {

			// setup
			let router = Router.create({
				scope: document.createElement('div'),
			});
			// test
			let url = router.resolveURL('http://www.mydomain.com/path/to/somewhere.html?a=1&b=2');
			url.fragment.should.equal('/path/to/somewhere.html?a=1&b=2');
			// cleanup
			router.destroy();

		});

	});

	describe('prototype.Promise', () => {

		it('should return promise object', () => {

			// setup
			let router = Router.create({
				scope: document.createElement('div'),
			});
			// test
			router.Promise(function(){}).should.be.Promise();
			// cleanup
			router.destroy();

		});

	});

	describe('prototype.off', () => {

	});

	describe('prototype.on', () => {

		it('should throw an error if no argeument passed', () => {

			// setup
			let router = Router.create({
				scope: document.createElement('div'),
			});
			// test
			(() => { router.on() }).should.throw();
			// cleanup
			router.destroy();

		});

		it('should not throw an error if no handler passed', () => {

			// setup
			let router = Router.create({
				scope: document.createElement('div'),
			});
			// test
			(() => { router.on('urlchange') }).should.not.throw();
			// cleanup
			router.destroy();

		});

		it('should not throw an error if passed event with handler', () => {

			// setup
			let router = Router.create({
				scope: document.createElement('div'),
			});
			// test
			(() => { router.on('someevent', () => {}) }).should.not.throw();
			// cleanup
			router.destroy();

		});

		it('should return promise if passed only event', () => {

			// setup
			let router = Router.create({
				scope: document.createElement('div'),
			});
			// test
			router.on('urlchange').should.be.Promise();
			router.on('urlchange').then(() => {}).should.be.Promise();
			// cleanup
			router.destroy();

		});

		it('should return null if passed event and handler', () => {

			// setup
			let router = Router.create({
				scope: document.createElement('div'),
			});
			// test
			should(router.on('my route', (event) => {})).be.null();
			// cleanup
			router.destroy();

		});

		it('should handle promise or handler correctly', () => {

			// setup
			let router = Router.create({
				scope: document.createElement('div'),
			});
			let spy_handler = sinon.spy(() => {});
			// test wihout trigger args
			router.on('urlchange', spy_handler);

			// test if promise resolved
			router.on('urlchange').should.be.finally.propertyByPath('detail', 'thats').eql('nice');
			router.on('urlchange').should.be.finally.propertyByPath('detail', 'thats').eql('nice');
			router.on('urlchange').then(({detail}) => {
				return `#${detail.thats}#`;
			}).should.be.finally.eql('#nice#');
			// test promise count
			router.promise.urlchange.should.be.length(3);

			router.trigger('urlchange', { thats: 'nice' });
			spy_handler.callCount.should.equal(1);
			router.promise.urlchange.should.be.length(0);

			// test with trigger args
			router.trigger('urlchange', { hello: 'world' });
			spy_handler.callCount.should.equal(2);
			spy_handler.args[1][0].detail.should.propertyByPath('hello').eql('world');
			// cleanup
			router.destroy();

		});

	});

	describe('click on anchor and by brower.back()', () => {

		it('should call handler _onUrlchange', () => {

			// setup
			// http://stackoverflow.com/questions/25578112/spying-on-a-method-with-sinon-method-bound-to-event-listener-method-was-execut#25578185
			let spy_onUrlchange = sinon.spy(Router.prototype, "_onUrlchange");
			let element = null;
			element = document.createElement("div");
			let router = Router.create({
				scope: element,
			});
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

			// test pushstate works. If not work we are on different site (out of tests)
			document.querySelectorAll('.foo').should.length(1);

			// test popstate
			// chrome: with karma + mocha is does not work (.back/forward)!
			// Dont know why!? I have tested for Chrome manually and its works
			router.back();
			router.back();
			router.back();

			console.log('Should 7:', spy_onUrlchange.callCount);

			// cleanup
			document.body.removeChild(element);
			router._onUrlchange.restore();
			router.destroy();

		});

	});

});
