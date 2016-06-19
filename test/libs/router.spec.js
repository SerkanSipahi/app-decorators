
// internal libs
import { Router } from 'src/apps/router';
import { XRegExp } from 'src/libs/dependencies';
import { Event } from 'test/mocks/event';
import { Location } from 'test/mocks/location';

describe('Class Router', () => {

	describe('_isDynamicURL method', () => {

		it('should return true if has variable in url otherwise false', () => {

			let router = Router.create();

			router._isDynamicURL('{{a}}').should.be.true();
			router._isDynamicURL('a').should.be.false();

			router.destroy();

		});

	});

	describe('_convertURLToRegex method', () => {

		it('should convert passed url to regex', () => {

			let router = Router.create();

			router._convertRouteToXRegexExp('{{year}}').should.be.equal('(?<year>.*?)');
			router._convertRouteToXRegexExp('{{hour}}:{{min}}').should.be.equal('(?<hour>.*?):(?<min>.*?)');
			router._convertRouteToXRegexExp('{{a}}/{{b}}/{{c}}').should.be.equal('(?<a>.*?)\\/(?<b>.*?)\\/(?<c>.*?)');

			router.destroy();

		});

	});

	describe('_addRoute method', () => {

		it('should add route and name to prototype._routes', () => {

			let router = Router.create();

			// add static routes
			router._addRoute('/this/is/a/route/1', 'name1');
			router._addRoute('/this/is/a/route/2', 'name2');
			router._addRoute('/this/is/{{a}}/route/4', 'name4');
			router._addRoute('/this/is/{{b}}/{{c}}/route/5', 'name5');

			// should throw error because route is already exists
			(() => { router._addRoute('/this/is/a/route/2', 'name2'); }).should.throw();
			(() => { router._addRoute('/this/is/{{a}}/route/4', 'name4'); }).should.throw();

			// Test static routes
			router._getRoutes('static').should.containEql({
				'/this/is/a/route/1': {
					name: 'name1',
					route: '/this/is/a/route/1',
					regex: null,
					params: null,
					fragment: null,
					cache: false,
				},
				'/this/is/a/route/2': {
					name: 'name2',
					route: '/this/is/a/route/2',
					regex: null,
					params: null,
					fragment: null,
					cache: false,
				},
			});

			// Test dynamic routes
			router._getRoutes('dynamic').should.containEql({
				'/this/is/{{a}}/route/4': {
					name: 'name4',
					route: '/this/is/{{a}}/route/4',
					regex: '\\/this\\/is\\/(?<a>.*?)\\/route\\/4',
					params: null,
					fragment: null,
					cache: false,
				},
				'/this/is/{{b}}/{{c}}/route/5': {
					name: 'name5',
					route: '/this/is/{{b}}/{{c}}/route/5',
					regex: '\\/this\\/is\\/(?<b>.*?)\\/(?<c>.*?)\\/route\\/5',
					params: null,
					fragment: null,
					cache: false,
				},
			});

			router.destroy();

		});

	});

	describe('_matchStaticURL method', () => {

		it('should return matchedObject by passed fragment', () => {

			let router = Router.create();
			router._addRoute('/this/is/a/route/1', 'route1');

			router._matchStaticURL('/this/is/a/route/1').should.containEql({
				name: 'route1',
				route: '/this/is/a/route/1',
				params: null,
				regex: null,
				fragment: '/this/is/a/route/1',
				cache: false,
			});

			should(router._matchStaticURL('/not/added/route')).be.exactly(null);
			router._matchStaticURL('/not/added/route');

			router.destroy();

		});

	});

	describe('_matchDynamicURL method', () => {

		it('should return matchedObject by passed fragment', () => {

			let router = Router.create();
			router._addRoute('/{{a}}/b/{{c}}/d', 'route1');

			router._matchDynamicURL('/foo/b/bar/d').should.containEql({
				name: 'route1',
				route: '/{{a}}/b/{{c}}/d',
				regex: '\\/(?<a>.*?)\\/b\\/(?<c>.*?)\\/d',
				params: {
					0: '/foo/b/bar/d',
					1: 'foo', 2: 'bar',
					a: 'foo', c: 'bar'
				},
				fragment: '/foo/b/bar/d',
				cache: false,
			});

			router.destroy();

		})

	});

	describe('_matchURL method', () => {

		let router = null;

		it('should return only valid value from _matchStaticURL by passed static path', () => {

			router = Router.create();
			router._addRoute('/some/static/path', 'route1');

			// test: it should call _matchStaticURL
			router._matchURL('/some/static/path');
			router._matchStaticURL.returnValues[0].name.should.be.equal('route1');
			router._matchDynamicURL.returnValues.should.be.length(0);
			should(router._getRouteCache.returnValues[0]).be.null();

		});

		it('should return only valid value from _matchDynamicURL by passed dynamic path', () => {

			router = Router.create();
			router._addRoute('/{{dynamic}}/b/{{path}}/d', 'route2');

			// test: it should call _matchDynamicURL
			router._matchURL('/hey/b/there/d');
			should(router._matchStaticURL.returnValues[0]).be.null();
			router._matchDynamicURL.returnValues[0].name.should.be.equal('route2');
			router._matchDynamicURL.returnValues[0].cache.should.be.false();
			should(router._getRouteCache.returnValues[0]).be.null();

		});

		it('should return on second call from cache by passed dynamic path', () => {

			router = Router.create();
			router._addRoute('/{{dynamic}}/b/{{path}}/d', 'route2');

			// test: returned not from cache
			router._matchURL('/hey/b/there/d');
			router._matchDynamicURL.returnValues[0].cache.should.be.false();

			// test: returned from cache
			router._matchURL('/hey/b/there/d');
			router._getRouteCache.returnValues[1].cache.should.be.true();

		});

		// setup
		beforeEach(() => {

			sinon.spy(Router.prototype, '_matchStaticURL');
			sinon.spy(Router.prototype, '_matchDynamicURL');
			sinon.spy(Router.prototype, '_getRouteCache');

		});
		afterEach(() => {

			router._matchStaticURL.restore();
			router._matchDynamicURL.restore();
			router._getRouteCache.restore();
			router.destroy();

		});

	});

	describe('_applyActionEvent (integration test) method', () => {

		/**
		 * We check only pushstate, all other methods are tested
		 */

		it('should call pushstate if click event passed', () => {

			let router = Router.create({ event_action: 'click a' });
			let spy_pushState = sinon.spy(router, "pushState");
			let event = new Event('click', {
				target: {
					href: 'http://www.domain.com/some/path.html',
				}
			});

			router._applyActionEvent(event);
			spy_pushState.callCount.should.equal(1);

			// cleanup
			router.pushState.restore();
			router.destroy();

		});

		it('should not call pushstate if pushstate event passed', () => {

			let router = Router.create({ event_action: 'click a' });
			let spy_pushState = sinon.spy(router, "pushState");
			let event = new Event('pushState', {
				target: {
					href: 'http://www.domain.com/some/path.html',
				}
			});

			router._applyActionEvent(event);
			spy_pushState.callCount.should.equal(0);

			// cleanup
			router.pushState.restore();
			router.destroy();

		});

	});

	describe('_getDefinedEventAction method', () => {

		it('should get defined event action', () => {

			let router = Router.create({
				event_action: 'my-action pattern'
			});

			router._getDefinedEventAction().should.be.equal('my-action');
			router.destroy();

		});

	});

	describe('_isDefinedEventAction method', () => {

		it('should check if passed event_type is euqal to our defined event type', () => {

			let router = Router.create({
				event_action: 'my-action pattern'
			});

			router._isDefinedEventAction('my-action').should.be.true();
			router._isDefinedEventAction('other-action').should.be.false();

			router.destroy();

		});

	});

	describe('_getCurrentHref method', () => {

		it('should get current href by passed event', () => {

			// mock location ( see above import)
			let locationMock = new Location({
				href : 'http://mockdomain.com/event/pushState/href.html'
			});
			// setup
			let router = Router.create({
				 event_action: 'myEvent a',
				 location: locationMock,
			});

			//*** Test click event ***
			// mock click event ( see above import)
			let eventClickMock = new Event('myEvent', {
				target: {
					href: 'http://mockdomain.com/event/click/href.html'
				}
			});
			router._getCurrentHref(eventClickMock).should.be.equal('http://mockdomain.com/event/click/href.html');

			//*** Test pushstate event ***
			// mock pushstate event  ( see above import)
			let eventPushstateMock = new Event('pushstate');
			router._getCurrentHref(eventPushstateMock).should.be.equal('http://mockdomain.com/event/pushState/href.html');

			// cleanup
			router.destroy();

		});

	});

	describe('_addPromise method', () => {

		it('should add and create promise collection on prototype.promise', () => {

			let router = Router.create();

			let promise1 = router._addPromise('name1');
			let promise2 = router._addPromise('name2');

			promise1.should.be.Promise();
			promise2.should.be.Promise();

			router.promise.should.have.propertyByPath('name1', 0).and.is.Function(); // resolve function
			router.promise.should.have.propertyByPath('name2', 0).and.is.Function(); // resolve function

			// cleanup: resolve promises
			router.promise.name1[0]();
			router.promise.name2[0]();
			// cleanup: destroy router
			router.destroy();

		});
	});

	describe('_urlFragmentChanged method', () => {

		it('should check if fragment is changed in combination with _setURLFragment', () => {

			let router = Router.create();

			router._setURLFragment('/');
			router._urlFragmentChanged('/some/url/fragment').should.be.true();

			router._setURLFragment('/some/url/fragment');
			router._urlFragmentChanged('/some/url/fragment').should.be.false();

			router.destroy();

		});

	});

	describe('createURL method', () => {

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

	describe('Promise method', () => {

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

	describe('addRouteListener method', () => {

		it('should do the same like prototype.on', () => {

			// It´s not necessary to test it, it´s almost the same
			// like prototype.on. The only difference is
			// the argument signature


	describe('stop', () => {

		it('it should stop if router running', () => {

			sinon.spy(Router.prototype, '_applyActionEvent');
			let router = Router.create();
			router.on('action', ::router._onAction);

			router.stop();
			router.trigger('action');
			router._applyActionEvent.callCount.should.be.equal(0);

			router._applyActionEvent.restore();
			router.destroy();

		});

	});

	describe('start', () => {

		it('it should start if router stoped', () => {

			sinon.spy(Router.prototype, '_applyActionEvent');
			let router = Router.create();
			router.on('action', ::router._onAction);

			router.stop();
			router.trigger('action');
			router._applyActionEvent.callCount.should.be.equal(0);

			router.start();
			router.trigger('action');
			router._applyActionEvent.callCount.should.be.equal(1);

			router._applyActionEvent.restore();
			router.destroy();


		});

	});

	describe('on method', () => {

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
			Object.keys(router._getRoutes('static')).should.be.length(4);

			// should throw error because route is already exists
			(() => { router.on('Detailpage /details.html'); }).should.throw();

			// routes count must be the same
			Object.keys(router._getRoutes('static')).should.be.length(4);

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

	describe('click on anchor or brower.back() and .destroy() remove events', () => {

		it('should call handler _onUrlchange', (done) => {

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

			spy_urlchange.args[0][0].fragment.should.equal('/index');
			spy_urlchange.args[1][0].fragment.should.equal('/index/details');
			spy_urlchange.args[2][0].fragment.should.equal('/index/details?a=1&b=2');
			spy_urlchange.args[3][0].fragment.should.equal('/index/details?a=1&b=2#c=3;d=4');

			// test pushstate works. If not work we are on different site (out of tests)
			element.querySelectorAll('.foo').should.length(1);

			// test native popstate
			router.back();
			router.back();
			router.back();

			// should be 2 because internal bind(_onUrlchange) and from
			// outside (router.on('urlchange'))
			router.scope.getHandlers('urlchange').should.be.length(2);

			// cleanup
			document.body.removeChild(element);
			router._onUrlchange.restore();

			setTimeout(() => {

				spy_onUrlchange.callCount.should.equal(7);
				spy_urlchange.args[4][0].fragment.should.equal('/index/details?a=1&b=2');
				spy_urlchange.args[5][0].fragment.should.equal('/index/details');
				spy_urlchange.args[6][0].fragment.should.equal('/index');

				// cleanup check
				router.destroy();
				// after destroy registered events should be removed
				should(router.scope.getHandlers('urlchange')).be.exactly(null);
				done();

			}, 100);

		});

		it('should match registered route (static pathname) without dynamic parameter', (done) => {

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

			router.on('SomePathURL').then(() => {
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

			// test off method
			router.off('Index');
			element.querySelector('.index').click();
			spy_index_handler.callCount.should.equal(1);

			// test off method
			router.off('SomePathURL');
			element.querySelector('.some-path-url').click();
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
