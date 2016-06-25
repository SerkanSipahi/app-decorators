
// internal libs
import { Router } from 'src/apps/router';
import { XRegExp } from 'src/libs/dependencies';
import { Event } from 'test/mocks/event';
import { Location } from 'test/mocks/location';

describe('Class Router', () => {

	describe('_isDynamicURL method', () => {

		it('should return true if has variable in url otherwise false', () => {

			// setup
			let router = Router.create();

			// test
			router._isDynamicURL('{{a}}').should.be.true();
			router._isDynamicURL('a').should.be.false();

			// cleanup
			router.destroy();

		});

	});

	describe('_convertURLToRegex method', () => {

		it('should convert passed url to regex', () => {

			// setup
			let router = Router.create();

			// test
			router._convertRouteToXRegexExp('{{year}}').should.be.equal('(?<year>[\\d\\w?()|{}_.,-]+)');
			router._convertRouteToXRegexExp('{{hour}}:{{min}}').should.be.equal('(?<hour>[\\d\\w?()|{}_.,-]+):(?<min>[\\d\\w?()|{}_.,-]+)');
			router._convertRouteToXRegexExp('{{a}}/{{b}}/{{c}}').should.be.equal('(?<a>[\\d\\w?()|{}_.,-]+)\\/(?<b>[\\d\\w?()|{}_.,-]+)\\/(?<c>[\\d\\w?()|{}_.,-]+)');
			router._convertRouteToXRegexExp('?id={{id}}&name={{name}}').should.be.equal('\\?id=(?<id>[\\d\\w?()|{}_.,-]+)&name=(?<name>[\\d\\w?()|{}_.,-]+)');
			router._convertRouteToXRegexExp('/details?page={{page}}').should.be.equal('\\/details\\?page=(?<page>[\\d\\w?()|{}_.,-]+)');
			router._convertRouteToXRegexExp('/details?page={{a}}|{{b}}').should.be.equal('\\/details\\?page=(?<a>[\\d\\w?()|{}_.,-]+)\\|(?<b>[\\d\\w?()|{}_.,-]+)');
			router._convertRouteToXRegexExp('/calc?add={{a}}+{{b}}').should.be.equal('\\/calc\\?add=(?<a>[\\d\\w?()|{}_.,-]+)\\+(?<b>[\\d\\w?()|{}_.,-]+)');
			router._convertRouteToXRegexExp('/calc?multi={{a}}*{{b}}').should.be.equal('\\/calc\\?multi=(?<a>[\\d\\w?()|{}_.,-]+)\\*(?<b>[\\d\\w?()|{}_.,-]+)');
			router._convertRouteToXRegexExp('/group?that=({{group}})').should.be.equal('\\/group\\?that=\\((?<group>[\\d\\w?()|{}_.,-]+)\\)');

			//cleanup
			router.destroy();

		});

	});

	describe('_addRoute method', () => {

		// setup
		let router = null;

		beforeEach(() => {

			// setup
			router = Router.create();
			// add static routes
			router._addRoute('/this/is/a/route/1', 'name1');
			router._addRoute('/this/is/a/route/2', 'name2');
			router._addRoute('/this/is/{{a}}/route/4', 'name4');
			router._addRoute('/this/is/{{b}}/{{c}}/route/5', 'name5');
			router._addRoute('/page?id={{id}}&name={{name}}', 'name6');
		});

		afterEach(() => router.destroy() );

		it('should return registered static routes', () => {

			router._getRoutes('static').should.containEql({
				'/this/is/a/route/1': {
					name: 'name1',
					type: 'static',
					route: '/this/is/a/route/1',
					regex: null,
					params: null,
					fragment: null,
					cache: false,
				},
				'/this/is/a/route/2': {
					name: 'name2',
					type: 'static',
					route: '/this/is/a/route/2',
					regex: null,
					params: null,
					fragment: null,
					cache: false,
				},
			});

		});

		it('should return registered dynamic routes', () => {

			router._getRoutes('dynamic').should.containEql({
				'/this/is/{{a}}/route/4': {
					name: 'name4',
					type: 'dynamic',
					route: '/this/is/{{a}}/route/4',
					regex: '\\/this\\/is\\/(?<a>[\\d\\w?()|{}_.,-]+)\\/route\\/4',
					params: null,
					fragment: null,
					cache: false,
				},
				'/this/is/{{b}}/{{c}}/route/5': {
					name: 'name5',
					type: 'dynamic',
					route: '/this/is/{{b}}/{{c}}/route/5',
					regex: '\\/this\\/is\\/(?<b>[\\d\\w?()|{}_.,-]+)\\/(?<c>[\\d\\w?()|{}_.,-]+)\\/route\\/5',
					params: null,
					fragment: null,
					cache: false,
				},
				'/page?id={{id}}&name={{name}}': {
					name: 'name6',
					type: 'dynamic',
					route: '/page?id={{id}}&name={{name}}',
					regex: '\\/page\\?id=(?<id>[\\d\\w?()|{}_.,-]+)&name=(?<name>[\\d\\w?()|{}_.,-]+)',
					params: null,
					fragment: null,
					cache: false,
				}
			});
		});

		it('should throw error if duplicate route added', () => {

			(() => { router._addRoute('/this/is/a/route/2', 'name2'); }).should.throw();
			(() => { router._addRoute('/this/is/{{a}}/route/4', 'name4'); }).should.throw();
		});

	});

	describe('_matchStaticURL method', () => {

		it('should return matchedObject by passed fragment', () => {

			// setup
			let router = Router.create();
			router._addRoute('/this/is/a/route/1', 'route1');

			// test: positiv
			router._matchStaticURL('/this/is/a/route/1').should.containEql({
				name: 'route1',
				type: 'static',
				route: '/this/is/a/route/1',
				params: null,
				regex: null,
				fragment: '/this/is/a/route/1',
				cache: false,
			});

			// test: negativ
			should(router._matchStaticURL('/not/added/route')).be.exactly(null);

			// cleanup
			router.destroy();

		});

	});

	describe('_matchDynamicURL method', () => {

		it('should return matchedObject by passed fragment', () => {

			// setup
			let router = Router.create();
			router._addRoute('/{{a}}/b/{{c}}/d', 'route1');
			router._addRoute('?id={{id}}&name={{name}}', 'route2');

			// test 1: positiv
			router._matchDynamicURL('/foo/b/bar/d').should.containEql({
				name: 'route1',
				type: 'dynamic',
				route: '/{{a}}/b/{{c}}/d',
				regex: '\\/(?<a>[\\d\\w?()|{}_.,-]+)\\/b\\/(?<c>[\\d\\w?()|{}_.,-]+)\\/d',
				params: {
					a: 'foo',
					c: 'bar',
				},
				fragment: '/foo/b/bar/d',
				cache: false,
			});

			// test 2: positiv (with queryString)
			router._matchDynamicURL('/a/b/c/page?id=26&name=mars&update=true').should.containEql({
				name: 'route2',
				type: 'dynamic',
				route: '?id={{id}}&name={{name}}',
				regex: '\\?id=(?<id>[\\d\\w?()|{}_.,-]+)&name=(?<name>[\\d\\w?()|{}_.,-]+)',
				params: {
					id: 26,
					name: 'mars',
				},
				fragment: '/a/b/c/page?id=26&name=mars&update=true',
				cache: false,
			});

			// test: negativ
			should(router._matchDynamicURL('/not/added/route')).be.exactly(null);

			// cleanup
			router.destroy();

		});

	});

	describe('_matchURL method', () => {

		let router = null;

		it('should return only valid value from _matchStaticURL by passed static path', () => {

			// setup
			router = Router.create();
			router._addRoute('/some/static/path', 'route1');

			// test: it should call _matchStaticURL
			router._matchURL('/some/static/path');
			router._matchStaticURL.returnValues[0].name.should.be.equal('route1');
			router._matchDynamicURL.returnValues.should.be.length(0);
			should(router._getRouteCache.returnValues[0]).be.null();

		});

		it('should return only valid value from _matchDynamicURL by passed dynamic path', () => {

			// setup
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

			// setup
			router = Router.create();
			router._addRoute('/{{dynamic}}/b/{{path}}/d', 'route2');

			// test: returned not from cache
			router._matchURL('/hey/b/there/d');
			router._matchDynamicURL.returnValues[0].cache.should.be.false();

			// test: returned from cache
			router._matchURL('/hey/b/there/d');
			router._getRouteCache.returnValues[1].cache.should.be.true();

			// cleanup
			router.destroy();

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
		 * We check only pushstate inside of _applyActionEvent,
		 * all other methods are tested.
		 */

		it('should call pushstate if click event passed', () => {

			// setup
			let router = Router.create({ event_action: 'click a' });
			let spy_pushState = sinon.spy(router, "pushState");
			// mock click event
			let event = new Event('click', {
				target: {
					href: 'http://www.domain.com/some/path.html',
				}
			});

			// test
			router._applyActionEvent(event);
			spy_pushState.callCount.should.equal(1);

			// cleanup
			router.pushState.restore();
			router.destroy();

		});

		it('should not call pushstate if pushstate event passed', () => {

			// setup
			let router = Router.create({ event_action: 'click a' });
			let spy_pushState = sinon.spy(router, "pushState");
			// mock pushState vent
			let event = new Event('pushState', {
				target: {
					href: 'http://www.domain.com/some/path.html',
				}
			});

			// test
			router._applyActionEvent(event);
			spy_pushState.callCount.should.equal(0);

			// cleanup
			router.pushState.restore();
			router.destroy();

		});

	});

	describe('_getDefinedEventAction method', () => {

		it('should get defined event action', () => {

			//setup
			let router = Router.create({
				event_action: 'my-action pattern'
			});

			// test
			router._getDefinedEventAction().should.be.equal('my-action');

			// cleanup
			router.destroy();

		});

	});

	describe('_isDefinedEventAction method', () => {

		it('should check if passed event_type is euqal to our defined event type', () => {

			// setup
			let router = Router.create({
				event_action: 'my-action pattern'
			});

			// test
			router._isDefinedEventAction('my-action').should.be.true();
			router._isDefinedEventAction('other-action').should.be.false();

			// cleanup
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

			// setup
			let router = Router.create();
			let promise1 = router._addPromise('name1');
			let promise2 = router._addPromise('name2');

			// test 1
			promise1.should.be.Promise();
			promise2.should.be.Promise();

			// test 2
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

			// setup
			let router = Router.create();

			// test 1
			router._setURLFragment('/');
			router._urlFragmentChanged('/some/url/fragment').should.be.true();

			// test 2
			router._setURLFragment('/some/url/fragment');
			router._urlFragmentChanged('/some/url/fragment').should.be.false();

			// cleanup
			router.destroy();

		});

	});

	describe('_isFloat', () => {

		it('should check if passed value is number or not', () => {

			// setup
			let router = Router.create();

			// test positiv: integer
			router._isNumeric(123).should.be.true();
			router._isNumeric('123').should.be.true();
			router._isNumeric(123.45).should.be.true();
			router._isNumeric('123.45').should.be.true();

			// test negativ: integer
			router._isNumeric('123.45a').should.be.false();
			router._isNumeric('123b').should.be.false();

			// cleanup
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

		});

	});

	describe('stop method', () => {

		it('it should stop if router running', () => {

			// setup
			sinon.spy(Router.prototype, '_applyActionEvent');
			let router = Router.create();
			router.on('action', ::router._onAction);

			// test
			router.stop();
			router.trigger('action');
			router._applyActionEvent.callCount.should.be.equal(0);

			//cleanup
			router._applyActionEvent.restore();
			router.destroy();

		});

	});

	describe('start method', () => {

		it('it should start if router stoped', () => {

			// setup
			sinon.spy(Router.prototype, '_applyActionEvent');
			let router = Router.create();
			router.on('action', ::router._onAction);

			// test 1
			router.stop();
			router.trigger('action');
			router._applyActionEvent.callCount.should.be.equal(0);

			// test 2
			router.start();
			router.trigger('action');
			router._applyActionEvent.callCount.should.be.equal(1);

			// cleanup
			router._applyActionEvent.restore();
			router.destroy();


		});

	});

	describe('whoami method', () => {

		it('it should return route information by passed fragment', () => {

			// setup
			let router = Router.create();
			router.on('myRoute1 /some/path.html', () => {});
			router.on('myRoute2 /some/{{integer}}/{{float}}/path.html', () => {});

			// test 1 - positiv
			router.whoami('/some/path.html').should.be.containEql({
				name: 'myRoute1',
				type: 'static',
				regex: null,
				cache: false,
			});

			// test 2 - positiv
			router.whoami('/some/123/4.34/path.html').should.be.containEql({
				name: 'myRoute2',
				type: 'dynamic',
				fragment: '/some/123/4.34/path.html',
				route: '/some/{{integer}}/{{float}}/path.html',
				regex: '\\/some\\/(?<integer>[\\d\\w?()|{}_.,-]+)\\/(?<float>[\\d\\w?()|{}_.,-]+)\\/path\\.html',
				params: {
					integer: 123,
					float:  4.34,
				},
				cache: false,
			});

			// test 3 - negativ
			should(router.whoami('/unknown/path.html')).be.exactly(null);

			// cleanup
			router.destroy();

		});

	});

	describe('which method', () => {

		it('it should return route information by passed name', () => {

			// setup
			let router = Router.create();
			router.on('myRoute1 /some/{{integer}}/{{float}}/path.html', () => {});

			// test 1 - positiv
			router.which('myRoute1').should.be.containEql({
				name: 'myRoute1',
				type: 'dynamic',
				fragment: null,
				route: '/some/{{integer}}/{{float}}/path.html',
				regex: '\\/some\\/(?<integer>[\\d\\w?()|{}_.,-]+)\\/(?<float>[\\d\\w?()|{}_.,-]+)\\/path\\.html',
				params: null,
				cache: false,
			});

			// test 2 - negativ
			should(router.which('unknownRoute')).be.exactly(null);

			// cleanup
			router.destroy();

		});

	});

	describe('constructURL method', () => {

		it('should construct url by passed static routename', () => {

			// setup
			let router = Router.create();
			router.on('myRoute1 /some/static/path.html', () => {});

			// test 1
			router.constructURL('myRoute1').should.be.equal('/some/static/path.html');

			// test 2 - ingores params
			router.constructURL('myRoute1', { a:1, b:2 }).should.be.equal('/some/static/path.html');

			// test 3 - throw
			(() => { router.constructURL() }).should.throw();

			// test 4 - throw
			(() => { router.constructURL('myRoute99') }).should.throw();
			(() => { router.constructURL('myRoute99', {c:3, d:4}) }).should.throw();

			// cleanup
			router.destroy();

		});

		it('should construct url by passed dynmic routename and params ', () => {


		});

	});

	describe('go method', () => {

		it('should go by passed static routename', () => {

			let router = Router.create();
			router.on('myRoute1 /some/static/path.html', () => {});
			sinon.spy(router, "pushState");

			// test 1
			router.go('myRoute1');
			router.pushState.callCount.should.be.equal(1);

			// test 2 - ingores params
			router.go('myRoute1', { a:1, b:2 });
			router.pushState.callCount.should.be.equal(2);

			// test 3 - throw
			(() => { router.go() }).should.throw();

			// test 4 - throw
			(() => { router.go('myRoute99') }).should.throw();
			(() => { router.go('myRoute99', {c:3, d:4}) }).should.throw();

			router.pushState.restore();
			router.destroy();

		});

		it('should go by passed dynmic routename and params ', () => {

		});

	});

	describe('on method, no arguments passed', () => {

		it('should throw an error', () => {

			// setup
			let router = Router.create({
				scope: document.createElement('div'),
			});

			// test
			(() => { router.on() }).should.throw();

			// cleanup
			router.destroy();

		});

	});

	describe('on method, no handler passed', () => {

		it('should not throw an error', () => {

			// setup
			let router = Router.create({
				scope: document.createElement('div'),
			});

			// test
			(() => { router.on('urlchange') }).should.not.throw();

			// cleanup
			router.destroy();

		});

	});

	describe('on method, eventType and handler passed', () => {

		it('should not throw an error', () => {

			// setup
			let router = Router.create({
				scope: document.createElement('div'),
			});

			// test
			(() => { router.on('someevent', () => {}) }).should.not.throw();

			// cleanup
			router.destroy();

		});

	});

	describe('on method, passed only eventType', () => {

		it('should return promise', () => {

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

	});

	describe('on method, passed eventType and handler', () => {

		it('should return null', () => {

			// setup
			let router = Router.create({
				scope: document.createElement('div'),
			});

			// test
			should(router.on('my route', (event) => {})).be.null();

			// cleanup
			router.destroy();

		});

	});

	describe('on method', () => {

		it('should handle promise or handler correctly', (done) => {

			// setup
			let router = Router.create({
				scope: document.createElement('div'),
			});
			let spy_handler = sinon.spy(() => {});
			router.on('urlchange', spy_handler);

			// test if promise resolved
			router.on('urlchange').should.be.finally.propertyByPath('thats').eql('nice');
			router.on('urlchange').should.be.finally.propertyByPath('thats').eql('nice');
			router.on('urlchange').then(({thats}) => {
				return `#${thats}#`;
			}).should.be.finally.eql('#nice#');

			// test promise count
			router.promise.urlchange.should.be.length(3);

			// test triggering of urlchange
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

	});

	describe('on method, registered many events', () => {

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

	});

	describe('on method, if explicitly triggering without params', () => {

		it('should trigger correct handler', () => {

			// setup
			let router = Router.create({
				scope: document.createElement('div'),
			});

			// spyies
			let spy_startpage_handler = sinon.spy(() => {});
			let spy_resultpage_handler = sinon.spy(() => {});

			router.on('Startpage /index.html', spy_startpage_handler);
			router.on('Resultpage /results.html', spy_resultpage_handler);

			router.trigger('Startpage');
			router.trigger('Resultpage');
			router.trigger('Resultpage');

			spy_startpage_handler.callCount.should.equal(1);
			spy_resultpage_handler.callCount.should.equal(2);

			// cleanup
			router.destroy();

		});

	});

	describe('on method, explicitly triggering with params', () => {

		it('should trigger correct handler', () => {

			// setup
			let router = Router.create({
				scope: document.createElement('div'),
			});

			// spyies
			let spy_configurator_handler = sinon.spy(() => {});

			router.on('Product /product/{{id}}-{{name}}.html', spy_configurator_handler);

			// test: positiv
			router.trigger('Product', { id: 123, name: 'foo' });
			router.trigger('Product', { id: 456, name: 'bar' });
			spy_configurator_handler.callCount.should.equal(2);

			// cleanup
			router.destroy();

		});

	});

	describe('on method, passed handler as href', () => {

		it.skip('should route to href', () => {

			// setup
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

	describe('_onUrlchange method', () => {

		it('should call registered callback on element.click()', () => {

			element.querySelector('.foo').click();
			element.querySelector('.bar').click();
			element.querySelector('.baz').click();
			element.querySelector('.baz').click();

			spy_urlchange.callCount.should.equal(3);

			spy_urlchange.args[0][0].fragment.should.equal('/index');
			spy_urlchange.args[1][0].fragment.should.equal('/index/details');
			spy_urlchange.args[2][0].fragment.should.equal('/index/details?a=1&b=2');

		});

		it('should call registered callback on router.back()', (done) => {

			element.querySelector('.foo').click();
			element.querySelector('.bar').click();
			element.querySelector('.baz').click();

			router.back();
			router.back();
			router.back();

			setTimeout(() => {

				spy_urlchange.args[0][0].fragment.should.equal('/index');
				spy_urlchange.args[1][0].fragment.should.equal('/index/details');
				spy_urlchange.args[2][0].fragment.should.equal('/index/details?a=1&b=2');
				spy_urlchange.args[3][0].fragment.should.equal('/index/details');
				spy_urlchange.args[4][0].fragment.should.equal('/index');

				done();

			}, 100);

		});

		// Setup
		let router, spy_onUrlchange, spy_urlchange, element;

		beforeEach(() => {

			spy_onUrlchange = sinon.spy(Router.prototype, "_onUrlchange");
			spy_urlchange = sinon.spy(() => {});
			element = document.createElement("div");
			router = Router.create({
				scope: element,
			});
			router.on('urlchange', spy_urlchange);

			element.classList.add('anchor-container');
			element.innerHTML = `
				<a class="foo" href="/index"> Index </a>
				<a class="bar" href="/index/details"> Details </a>
				<a class="baz" href="/index/details?a=1&b=2"> Params </a>
			`;
			document.body.appendChild(element);

		});

		afterEach(() => {

			// cleanup check
			router.destroy();
			document.body.removeChild(element);
			router._onUrlchange.restore();

		});

	});

	describe('on method', () => {

		it('should match registered static and dynamic url route', (done) => {

			/**
			 * Static Test
			 */

			// register
			router.on('Index /index.html', spy_index_handler);
			router.on('SomePathURL /some/path/url.html', spy_somePathURL_handler);

			// trigger events by clicking
			element.querySelector('.index').click();
			element.querySelector('.some-path-url').click();
			element.querySelector('.not-registered-url').click();
			element.querySelector('.some-path-url').click();

			// test
			spy_index_handler.callCount.should.equal(1);
			spy_somePathURL_handler.callCount.should.equal(2);

			/**
			 * Dynamic Test
			 */

			// register
			router.on('SomeDynamicURL /{{name}}/{{surname}}/123', ({ params, fragment }) => {
				params.name.should.be.equal('serkan');
				params.surname.should.be.equal('sipahi');
				fragment.should.be.equal('/serkan/sipahi/123');
				done();
			});

			// trigger events by clicking
			element.querySelector('.some-dynamic-path').click();

		});

		it('should trigger registered promise event', (done) => {

			// test 1
			router.on('SomePathURL /some/path/url.html').then(({fragment, id}) => {
				return `${fragment}?id=${id}`;
			}).should.be.finally.eql('/some/path/url.html?id=123');

			router.trigger('SomePathURL', { fragment: '/some/path/url.html', id: 123 });

			setTimeout(done, 200);

		});

		// Setup
		let element, spy_index_handler, spy_somePathURL_handler, spy_dynamicPath_handler, router;

		beforeEach(() => {

			router = Router.create({
				scope: element,
			});

			spy_index_handler = sinon.spy(() => {});
			spy_somePathURL_handler = sinon.spy(() => {});
			spy_dynamicPath_handler = sinon.spy(() => {});

			element = document.createElement("div");
			element.classList.add('anchor-container');
			element.innerHTML = `
				<a class="index" href="/index.html"> Index </a>
				<a class="some-path-url" href="/some/path/url.html"> Some path URL </a>
				<a class="some-dynamic-path" href="/serkan/sipahi/123"> Some Dynamic URL </a>
				<a class="not-registered-url" href="/not/registered/url.html"> Not registered URL </a>
			`;
			document.body.appendChild(element);

		});

		afterEach(() => {

			// cleanup
			document.body.removeChild(element);
			router.destroy();

		});

	});

	describe('off method', () => {

		it('should remove event by passed eventType', () => {

		});

		it('should throw error if not eventType passed', () => {

		});

	});

	describe('destroy method', () => {

		it('should remove all registered events', () => {

		});

	});

	describe('create() function', () => {

		it('should register many routes at once', () => {

		});

		it('should bind scope to handlers', () => {

		});

	});

});
