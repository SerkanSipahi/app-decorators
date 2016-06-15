
// internal libs
import Router from 'src/apps/router';

describe('Class Router', () => {

	describe('prototype.addRoute', () => {

		it('should add route and name to prototype._routes', () => {

			let router = Router.create();

			router._addRoute('/this/is/a/route1', 'name1');
			router._addRoute('/this/is/a/route2', 'name2');
			// this should not be added because it can exists only one route
			router._addRoute('/this/is/a/route2', 'name2');

			// Test: contain correct added routes
			router._routes.should.containEql({
				'/this/is/a/route1': 'name1',
				'/this/is/a/route2': 'name2',
			});

		});

	});



	describe('prototype.createURL', () => {

		it('should return url object with additional "fragment" property', () => {

			// setup
			let router = Router.create({
				scope: document.createElement('div'),
			});
			// test
			let url = router.createURL('http://www.mydomain.com/path/to/somewhere.html?a=1&b=2');
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

		it('should handle promise or handler correctly', (done) => {

			// setup
			let router = Router.create({
				scope: document.createElement('div'),
			});
			let spy_handler = sinon.spy(() => {});
			// test wihout trigger args
			router.on('urlchange', spy_handler);

			// test if promise resolved
			router.on('urlchange').should.be.finally.propertyByPath('thats').eql('nice');
			router.on('urlchange').should.be.finally.propertyByPath('thats').eql('nice');
			router.on('urlchange').then(({thats}) => {
				return `#${thats}#`;
			}).should.be.finally.eql('#nice#');
			// test promise count
			router.promise.urlchange.should.be.length(3);

			router.trigger('urlchange', { thats: 'nice' });
			spy_handler.callCount.should.equal(1);
			router.promise.urlchange.should.be.length(0);

			// test with trigger args
			router.trigger('urlchange', { hello: 'world' });
			spy_handler.callCount.should.equal(2);
			spy_handler.args[1][0].should.propertyByPath('hello').eql('world');

			// need this timeout for promise tests
			setTimeout(() => {
				// cleanup
				router.destroy();
				done();
			}, 10);

		});

		it('should assign routes correctly', () => {

			// setup
			let router = Router.create({
				scope: document.createElement('div'),
			});

			router.on('Startpage /index.html');
			router.on('Resultpage /results.html');
			router.on('Detailpage /details.html');
			router.on('Configurator /configurator.html');

			// test routes count
			Object.keys(router.getRoutes()).should.be.length(4);

			// add registered route
			router.on('Detailpage /details.html');
			// routes count must be the same
			Object.keys(router.getRoutes()).should.be.length(4);

			// cleanup
			router.destroy();

		});

		it('should trigger correct handler on explicitly triggering', () => {

			let router = Router.create({
				scope: document.createElement('div'),
			});

			let spy_startpage_handler = sinon.spy(() => {});
			let spy_resultpage_handler = sinon.spy(() => {});
			let spy_detailpage_handler = sinon.spy(() => {});
			let spy_configurator_handler = sinon.spy(() => {});

			router.on('Startpage /index.html', spy_startpage_handler);
			router.on('Resultpage /results.html', spy_resultpage_handler);
			router.on('Detailpage /details.html', spy_detailpage_handler);
			router.on('Configurator /configurator.html', spy_configurator_handler);
			// router.on('Product /product/{{id}}-{{name}}.html', spy_configurator_handler);

			router.trigger('Startpage');
			router.trigger('Resultpage');
			router.trigger('Resultpage');
			router.trigger('Detailpage');
			router.trigger('Configurator');
			// router.trigger('Product', { id: 123, name: 'foo' });
			// router.trigger('Product', { id: 123 }); // should throw error because name missing

			spy_startpage_handler.callCount.should.equal(1);
			spy_resultpage_handler.callCount.should.equal(2);
			spy_detailpage_handler.callCount.should.equal(1);
			spy_configurator_handler.callCount.should.equal(1);

			router.destroy();

		});

		it.skip('should route to correct href if handler is linkname (idea not implemented)', () => {

			let router = Router.create({
				scope: document.createElement('div'),
			});

			router.on('Google /index.html', 'https://www.google.de');
			router.on('AbsoluteURL /absolute.html', '/absolute-internal-url.html');
			router.on('RelativeURL /relative.html', 'relative-internal-url.html');

			router.trigger('Google');
			router.trigger('AbsoluteURL');
			router.trigger('RelativeURL');

		});

	});

	describe('_hasVariableInURL method', () => {

		it('should return true if has variable in url otherwise false', () => {

			let router = Router.create();

			router._hasVariableInURL('{{a}}').should.be.true();
			router._hasVariableInURL('a').should.be.false();

			router.destroy();

		});

	});

	describe('_convertURLToRegex method', () => {

		it('should convert passed url to regex', () => {

			let router = Router.create();

			router._convertURLToXRegexExp('{{year}}').should.be.equal('(?<year>.*?)');
			router._convertURLToXRegexExp('{{hour}}:{{min}}').should.be.equal('(?<hour>.*?):(?<min>.*?)');
			router._convertURLToXRegexExp('{{a}}/{{b}}/{{c}}').should.be.equal('(?<a>.*?)\\/(?<b>.*?)\\/(?<c>.*?)');

			router.destroy();

		});

	});

	describe('click on anchor or brower.back()', () => {

		it('should call handler _onUrlchange', () => {

			// setup
			// http://stackoverflow.com/questions/25578112/spying-on-a-method-with-sinon-method-bound-to-event-listener-method-was-execut#25578185
			let spy_onUrlchange = sinon.spy(Router.prototype, "_onUrlchange");
			let spy_urlchange = sinon.spy(() => {});
			let element = null;
			element = document.createElement("div");
			let router = Router.create({
				scope: element,
			});

			router.on('urlchange', spy_urlchange);

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

			spy_urlchange.callCount.should.equal(4);

			// test pushstate works. If not work we are on different site (out of tests)
			element.querySelectorAll('.foo').should.length(1);

			// test popstate
			// chrome: with karma + mocha it does not work (.back/forward)!
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

		it('should match registered route (pathname) without dynamic parameter', (done) => {

			let element = null;
			element = document.createElement("div");
			let router = Router.create({
				scope: element,
			});
			element.classList.add('anchor-container');
			element.innerHTML = `
				<a class="index" href="/index.html"> Index </a>
				<a class="some-path-url" href="/some/path/url.html"> Some path URL </a>
				<a class="not-registered-url" href="/not/registered/url.html"> Not registered URL </a>
			`;
			document.body.appendChild(element);

			let spy_index_handler = sinon.spy(() => {});
			let spy_somePathURL_handler = sinon.spy(() => {});

			// register by handler
			router.on('Index /index.html', spy_index_handler);
			router.on('SomePathURL /some/path/url.html', spy_somePathURL_handler);
			// register by promise
			router.on('SomePathURL /some/path/url.html').then(() => {
				return 'matched';
			}).should.be.finally.eql('matched');

			element.querySelector('.index').click();
			element.querySelector('.some-path-url').click();
			element.querySelector('.not-registered-url').click();

			spy_index_handler.callCount.should.equal(1);
			spy_somePathURL_handler.callCount.should.equal(1);

			element.querySelector('.some-path-url').click();

			spy_index_handler.callCount.should.equal(1);
			spy_somePathURL_handler.callCount.should.equal(2);

			// need this timeout for promise tests
			setTimeout(() => {
				// cleanup
				document.body.removeChild(element);
				router.destroy();
				done();
			}, 10);

		});

	});

});
