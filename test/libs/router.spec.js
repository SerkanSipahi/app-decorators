import { bootstrapPolyfills } from 'src/bootstrap';
import { XRegExp } from 'src/libs/dependencies';
import { Event } from 'test/mocks/event';
import { Location } from 'test/mocks/location';
import { delay } from 'src/helpers/delay';
import $ from 'jquery';

import 'src/helpers/jquery.click-and-wait';
import 'src/helpers/history.back-forward-and-wait';

import sinon from 'sinon';

describe('Class Router', async () => {

	await bootstrapPolyfills;
	let { Router } = await System.import('src/apps/router');

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

			// test - convert special regex characters
			router._convertRouteToXRegexExp('/|+*?.()').should.be.equal('\\/\\|\\+\\*\\?\\.\\(\\)');

			// test - strict
			router._convertRouteToXRegexExp('abc', true).should.be.equal('^abc$');

			//cleanup
			router.destroy();

		});

	});

	describe('_convertURLToRegex and match', () => {

		it('should match converted URLRegex', () => {

			// setup
			let router = Router.create();

			// test
			let regex = router._convertRouteToXRegexExp('/a/{{b}}/c?id={{d}}&e#f&{{g}}');
			let compiledRegex = router.RegExp(`^${regex}$`);
			let result1 = compiledRegex.exec('/a/be/c?id=de&e#f&ge').groups();

			result1.should.containEql({
				b: "be",
				d: "de",
				g: "ge"
			});

			let result2 = compiledRegex.exec('/a/be/c');
			should(result2).be.null();

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
			router._addRoute('/this/is/{{a}}/route/3', 'name3');
			router._addRoute('/this/is/{{b}}/{{c}}/route/4', 'name4');
			router._addRoute('?id={{id}}&name={{name}}', 'name5');
			router._addRoute('?name=serkan', 'name6');
			router._addRoute('#im-{{foo}}', 'name7');
			router._addRoute('#scroll-to-foo', 'name8');
		});

		afterEach(() => router.destroy() );

		it('should return registered routes', () => {

			router._routes.should.containEql({
				pathname: {
					'/this/is/{{a}}/route/3': {
						name: 'name3',
						type: 'dynamic',
						route: '/this/is/{{a}}/route/3',
						handler: undefined,
						urlpart: 'pathname',
						regex: '^\\/this\\/is\\/(?<a>[\\d\\w?()|{}_.,-]+)\\/route\\/3$',
						params: null,
						fragment: null,
						cache: false,
					},
					'/this/is/{{b}}/{{c}}/route/4': {
						name: 'name4',
						type: 'dynamic',
						route: '/this/is/{{b}}/{{c}}/route/4',
						handler: undefined,
						urlpart: 'pathname',
						regex: '^\\/this\\/is\\/(?<b>[\\d\\w?()|{}_.,-]+)\\/(?<c>[\\d\\w?()|{}_.,-]+)\\/route\\/4$',
						params: null,
						fragment: null,
						cache: false,
					},
					'/this/is/a/route/1': {
						name: 'name1',
						type: 'static',
						route: '/this/is/a/route/1',
						handler: undefined,
						urlpart: 'pathname',
						regex: '^\\/this\\/is\\/a\\/route\\/1$',
						params: null,
						fragment: null,
						cache: false,
					},
					'/this/is/a/route/2': {
						name: 'name2',
						type: 'static',
						route: '/this/is/a/route/2',
						handler: undefined,
						urlpart: 'pathname',
						regex: '^\\/this\\/is\\/a\\/route\\/2$',
						params: null,
						fragment: null,
						cache: false,
					}
				},
				search: {
					'?id={{id}}&name={{name}}': {
						name: 'name5',
						type: 'dynamic',
						route: '?id={{id}}&name={{name}}',
						handler: undefined,
						urlpart: 'search',
						regex: '\\?id=(?<id>[\\d\\w?()|{}_.,-]+)&name=(?<name>[\\d\\w?()|{}_.,-]+)',
						params: null,
						fragment: null,
						cache: false,
					},
					'?name=serkan': {
						name: 'name6',
						type: 'static',
						route: '?name=serkan',
						handler: undefined,
						urlpart: 'search',
						regex: '\\?name=serkan',
						params: null,
						fragment: null,
						cache: false,
					}
				},
				hash: {
					'#im-{{foo}}': {
						name: 'name7',
						type: 'dynamic',
						route: '#im-{{foo}}',
						handler: undefined,
						urlpart: 'hash',
						regex: '#im-(?<foo>[\\d\\w?()|{}_.,-]+)',
						params: null,
						fragment: null,
						cache: false,
					},
					'#scroll-to-foo': {
						name: 'name8',
						type: 'static',
						route: '#scroll-to-foo',
						handler: undefined,
						urlpart: 'hash',
						regex: '#scroll-to-foo',
						params: null,
						fragment: null,
						cache: false,
					}
				}
			});

		});

		it('should throw error if duplicate route added', () => {

			(() => { router._addRoute('/this/is/a/route/1', 'name1'); }).should.throw();
			(() => { router._addRoute('/this/is/a/route/2', 'name2'); }).should.throw();
			(() => { router._addRoute('/this/is/{{a}}/route/3', 'name3'); }).should.throw();
			(() => { router._addRoute('/this/is/{{b}}/{{c}}/route/4', 'name4'); }).should.throw();
			(() => { router._addRoute('?id={{id}}&name={{name}}', 'name5'); }).should.throw();
			(() => { router._addRoute('?name=serkan', 'name6'); }).should.throw();
			(() => { router._addRoute('#im-{{foo}}', 'name7'); }).should.throw();
			(() => { router._addRoute('#scroll-to-foo', 'name8'); }).should.throw();
		});

		it('should throw error if not valid route passed', () => {

			(() => { router._addRoute('/a/b?id=5', 'name1'); }).should.throw();
			(() => { router._addRoute('/a/b?id=5#foo', 'name2'); }).should.throw();
			(() => { router._addRoute('?id=5#foo', 'name3'); }).should.throw();
		});

		it('should throw error if eventName already exists', () => {

			(() => { router._addRoute('/x/y?id=11', 'name1'); }).should.throw();

		});

		it('should throw error if not correct prefixed with "/, ?, #', () => {

			(() => { router._addRoute('a/b.html', 'name1'); }).should.throw();
			(() => { router._addRoute('a=b', 'name2'); }).should.throw();

		});

	});

	describe('_existsEvent method', () => {

		// setup
		let router = null;

		beforeEach(() => {

			// setup
			router = Router.create();
			// add static routes
			router._addRoute('/this/is/a/route/1', 'name1');
			router._addRoute('?id={{id}}&name={{name}}', 'name2');
			router._addRoute('?name=serkan', 'name3');
			router._addRoute('#im-{{foo}}', 'name4');
		});

		afterEach(() => router.destroy() );

		it('should check if event already exists', () => {

			router._existsEvent('name1').should.be.true();
			router._existsEvent('name3').should.be.true();

		});

		it('should check if event not exists', () => {

			router._existsEvent('name5').should.be.false();
			router._existsEvent('name6').should.be.false();

		});

	});

	describe('_match method', () => {

		it('should return matchedObject by passed fragment', () => {

			// setup
			let router = Router.create();
			router._addRoute('/{{a}}/b/{{c}}/d', 'route1');
			router._addRoute('?id={{id}}&name={{name}}', 'route2');
			router._addRoute('/this/is/a/route/1', 'route3');
			router._addRoute('?name=serkan', 'route4');

			// test 1: positiv
			router._match('/foo/b/bar/d', 'pathname').should.containEql({
				name: 'route1',
				type: 'dynamic',
				route: '/{{a}}/b/{{c}}/d',
				handler: undefined,
				urlpart: 'pathname',
				regex: '^\\/(?<a>[\\d\\w?()|{}_.,-]+)\\/b\\/(?<c>[\\d\\w?()|{}_.,-]+)\\/d$',
				params: {
					a: 'foo',
					c: 'bar',
				},
				fragment: '/foo/b/bar/d',
				cache: false,
			});

			// test 2: positiv
			router._match('?id=26&name=mars&update=true', 'search').should.containEql({
				name: 'route2',
				type: 'dynamic',
				route: '?id={{id}}&name={{name}}',
				handler: undefined,
				urlpart: 'search',
				regex: '\\?id=(?<id>[\\d\\w?()|{}_.,-]+)&name=(?<name>[\\d\\w?()|{}_.,-]+)',
				params: {
					id: 26,
					name: 'mars',
				},
				fragment: '?id=26&name=mars&update=true',
				cache: false,
			});

			// test 3: positiv
			router._match('/this/is/a/route/1', 'pathname').should.containEql({
				name: 'route3',
				type: 'static',
				route: '/this/is/a/route/1',
				handler: undefined,
				urlpart: 'pathname',
				params: {},
				regex: '^\\/this\\/is\\/a\\/route\\/1$',
				fragment: '/this/is/a/route/1',
				cache: false,
			});

			// test 4: positiv
			router._match('?name=serkan', 'search').should.containEql({
				name: 'route4',
				type: 'static',
				route: '?name=serkan',
				handler: undefined,
				urlpart: 'search',
				params: {},
				regex: '\\?name=serkan',
				fragment: '?name=serkan',
				cache: false,
			});

			// test: negativ
			should(router._match('/not/added/route', 'pathname')).be.exactly(null);
			should(router._match('?x=1', 'search')).be.exactly(null);
			should(router._match('#this-hash', 'hash')).be.exactly(null);

			// cleanup
			router.destroy();

		});

	});

	describe('_normalizeMatchedXRegex method', () => {

		it('it should normalize matched XRegex object', () => {

			// setup
			let router = Router.create();

			let mockXRegexMatchedObject = {
				a: '123', b: 'be', c: 456, d: '1.34'
			};

			router._normalizeMatchedXRegex(mockXRegexMatchedObject).should.containEql({
				a: 123,
				b: 'be',
				c: 456,
				d: 1.34
			});

			// cleanup
			router.destroy();

		});

	});

	describe('_matchURL method (integration test)', () => {

		let router = null;

		it('should return only valid value from _match by passed static path', () => {

			// setup
			router = Router.create();
			router._addRoute('/some/static/path', 'route1');

			// test: it should call _match
			router._matchURL('/some/static/path', ['pathname']);
			router._match.returnValues[0].name.should.be.equal('route1');
			router._match.returnValues[0].cache.should.be.false();
			should(router._getRouteCache.returnValues[0]).be.null();

		});

		it('should return only valid value from _match by passed dynamic path', () => {

			// setup
			router = Router.create();
			router._addRoute('/{{dynamic}}/b/{{path}}/d', 'route2');

			// test: it should call _match
			router._matchURL('/hey/b/there/d', ['pathname']);
			router._match.returnValues[0].name.should.be.equal('route2');
			router._match.returnValues[0].cache.should.be.false();
			should(router._getRouteCache.returnValues[0]).be.null();

		});

		it('should return on second call from cache by passed dynamic path', () => {

			// setup
			router = Router.create();
			router._addRoute('/{{dynamic}}/b/{{path}}/d', 'route2');

			// test: returned not from cache
			router._matchURL('/hey/b/there/d', ['pathname']);
			router._match.returnValues[0].cache.should.be.false();

			// test: returned from cache
			router._matchURL('/hey/b/there/d', ['pathname']);
			router._getRouteCache.returnValues[1].cache.should.be.true();

		});

		it('should return array with matched object', () => {

			// setup
			router = Router.create();
			router._addRoute('/{{dynamic}}/b/{{path}}/d', 'route1');
			router._addRoute('?name=test', 'route2');
			router._addRoute('#im-hash', 'route3');

			// test 1
			router._matchURL('/hey/b/there/d', ['pathname'])[0].should.containEql({
				name: 'route1',
				cache: false,
			});

			// test 2
			router._matchURL('?name=test&whats=up', ['search'])[0].should.containEql({
				name: 'route2',
				cache: false,
			});

		});

		it('should return array with matched parts', () => {

			// setup
			let changepart, matchedResults;

			router = Router.create();
			router._addRoute('/{{dynamic}}/b/{{path}}/d', 'route1');
			router._addRoute('?name={{name}}', 'route2');
			router._addRoute('#im-hash', 'route3');

			// test 1 if only changed
			changepart = ['pathname', 'search', 'hash'];

			matchedResults = router._matchURL('/hey/b/there/d?name=serkan#im-hash', changepart);
			matchedResults.should.be.length(3);

			matchedResults[0].should.containEql({ name: 'route1' });
			matchedResults[1].should.containEql({ name: 'route2' });
			matchedResults[2].should.containEql({ name: 'route3' });

			// test 2 if only changed
			changepart = ['search', 'hash'];

			matchedResults = router._matchURL('/hey/b/there/d?name=serkan#im-hash', changepart);
			matchedResults.should.be.length(2);

			matchedResults[0].should.containEql({ name: 'route2' });
			matchedResults[1].should.containEql({ name: 'route3' });

		});

		// setup
		beforeEach(() => {

			sinon.spy(Router.prototype, '_match');
			sinon.spy(Router.prototype, '_getRouteCache');

		});
		afterEach(() => {

			router._match.restore();
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
			let router = Router.create({
				event: {
					action: 'click a'
				}
			});
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
			let router = Router.create({
				event: {
					action: 'click a'
				}
			});
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
				event: {
					action: 'my-action pattern'
				}
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
				event: {
					action: 'my-action pattern'
				}
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
				event: {
					action: 'myEvent a',
				},
				helper: {
					location: locationMock,
				}
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

	describe('_convertFragmentToParts method', () => {

		it('should convert fragment into parts', () => {

			// setup
			let router = Router.create();

			// test 1
			router._convertFragmentToParts('/a/b/c').should.containEql({
				pathname: '/a/b/c', search: '', hash: ''
			});

			// test 2
			router._convertFragmentToParts('/a/b/c?a=1&b=2').should.containEql({
				pathname: '/a/b/c', search: '?a=1&b=2', hash: ''
			});

			// test 3
			router._convertFragmentToParts('/a/b/c?a=1&b=2#hello-world').should.containEql({
				pathname: '/a/b/c', search: '?a=1&b=2', hash: '#hello-world'
			});

			// test 4
			router._convertFragmentToParts('/a/b/c?a=1&b=2').should.containEql({
				pathname: '/a/b/c', search: '?a=1&b=2', hash: ''
			});

			// test 5
			router._convertFragmentToParts('/?a=1&b=2#hello-world').should.containEql({
				pathname: '/', search: '?a=1&b=2', hash: '#hello-world'
			});

			// test 6
			router._convertFragmentToParts('?a=1&b=2#hello-world').should.containEql({
				pathname: '/', search: '?a=1&b=2', hash: '#hello-world'
			});

			// test 7
			router._convertFragmentToParts('#hello-world').should.containEql({
				pathname: '/', search: '', hash: '#hello-world'
			});

			// test 8
			router._convertFragmentToParts('/#hello-world').should.containEql({
				pathname: '/', search: '', hash: '#hello-world'
			});

			// test 9
			router._convertFragmentToParts('/').should.containDeep({
				pathname: '/', search: '', hash: ''
			});

			// cleanup
			router.destroy();

		});

	});

	describe('_diffFragmentParts method', () => {

		it('should diff passed object', () => {

			// setup
			let router = Router.create();
			let fragmentPart1, fragmentPart2;

			// test 1
			fragmentPart1 = { pathname: '/', search: '', hash: ''};
			fragmentPart2 = { pathname: '/', search: '', hash: ''};
			router._diffFragmentParts(fragmentPart1, fragmentPart2).should.containDeep([]);

			// test 2
			fragmentPart1 = { pathname: '/', search: '', hash: ''};
			fragmentPart2 = { pathname: '/', search: 'b', hash: ''};
			router._diffFragmentParts(fragmentPart1, fragmentPart2).should.containDeep(['search']);
			router._diffFragmentParts(fragmentPart1, fragmentPart2).should.not.containDeep(['pathname', 'hash']);

			// test 3
			fragmentPart1 = { pathname: '/', search: '', hash: ''};
			fragmentPart2 = { pathname: '/a', search: 'b', hash: ''};
			router._diffFragmentParts(fragmentPart1, fragmentPart2).should.containDeep(['pathname', 'search']);
			router._diffFragmentParts(fragmentPart1, fragmentPart2).should.not.containDeep(['hash']);

			// test 4
			fragmentPart1 = { pathname: '/', search: '', hash: ''};
			fragmentPart2 = { pathname: '/a', search: 'b', hash: 'c'};
			router._diffFragmentParts(fragmentPart1, fragmentPart2).should.containDeep(['pathname', 'search', 'hash']);

			// cleanup
			router.destroy();

		});

	});

	describe('_diffFragments method', () => {

		it('should check if fragment is changed in combination with _setURLFragment', () => {

			// setup
			let router = Router.create();

			// test 1
			router._diffFragments('/', '/a/b/c').should.containEql({
				changed: true,
				changepart: ['pathname']
			});

			// test 2
			router._diffFragments('/a/c/c', '/a/c/c?a=b&c=d#foo').should.containEql({
				changed: true,
				changepart: ['search', 'hash']
			});

			// test 3
			router._diffFragments('/a/c/c?a=b&c=d#foo', '/a/c/c?a=b&c=d#foo').should.containEql({
				changed: false,
				changepart: []
			});

			// test 4
			router._diffFragments('/a/c/c?a=b&c=d#foo', '/a/c/e?a=b&c=d#foo').should.containEql({
				changed: true,
				changepart: ['pathname']
			});

			// cleanup
			router.destroy();

		});

	});

	describe('_isNumeric', () => {

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

	describe('_immutable', () => {

		it('should make passed object immutable', () => {

			// setup
			let myObject = { a: 1 };
			let router = Router.create();

			router._immutable(myObject).should.not.equal(myObject);

		});

	});

	describe('createURL method', () => {

		it('should return url object with additional "fragment" property', () => {

			// setup
			let router = Router.create({
				scope: document.createElement('div'),
			});

			// test
			let url = router.createURL('http://www.mydomain.com/path/to/somewhere.html?a=1&b=2#foo');
			url.pathname.should.equal('/path/to/somewhere.html');
			url.search.should.equal('?a=1&b=2');
			url.hash.should.equal('#foo');
			url.fragment.should.equal('/path/to/somewhere.html?a=1&b=2#foo');

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

	describe('guid method helper', () => {

		it('should generate uid', () => {

			// setup
			let router1 = Router.create({
				scope: document.createElement('div'),
			});
			let router2 = Router.create({
				scope: document.createElement('div'),
			});

			// test 1
			router1._uid.match(/^[a-z0-9]+-[a-z0-9]+-[a-z0-9]+-[a-z0-9]+-[a-z0-9]+$/);
			router1._uid.should.not.be.equal(router2._uid);

			// test 2
			let uid1 = router1.guid();
			let uid2 = router1.guid();

			uid1.should.match(/^[a-z0-9]+-[a-z0-9]+-[a-z0-9]+-[a-z0-9]+-[a-z0-9]+$/);
			uid1.should.not.be.equal(uid2);

			// cleanup
			router1.destroy();
			router2.destroy();

		});

	});

	describe('addRouteListener method', () => {

		it('should do the same like prototype.on', () => {

			// It´s not necessary to test it, it´s almost the same
			// like prototype.on. The only difference is
			// the argument signature

		});

	});

	describe('On method', () => {

		it('should throw error if passed handler is not Function or undefined', () => {

			// setup
			let router = Router.create({
				scope: document.createElement('div'),
			});

			(() => { router.on('route /a/b/c.html', null) }).should.throw();
			(() => { router.on('route /a/b/c.html', '') }).should.throw();
			(() => { router.on('route /a/b/c.html', 123) }).should.throw();
			(() => { router.on('route /a/b/c.html', true) }).should.throw();
			(() => { router.on('route /a/b/c.html', []) }).should.throw();
			(() => { router.on('route /a/b/c.html', {}) }).should.throw();

			(() => { router.on('route /a/b/c.html', () => {}) }).should.not.throw();
			(() => { router.on('route /a/b/c.html', undefined) }).should.not.throw();

			// cleanup
			router.destroy();

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

			function func1(){}
			function func2(){}
			function func3(){}
			function func4(){}
			function func5(){}
			function func6(){}

			// setup
			let router = Router.create(), result;
			router.on('myRoute1 /', func1);
			router.on('myRoute2 /some/path.html', func2);
			router.on('myRoute3 /some/{{integer}}/{{float}}/path.html', func3);
			router.on('myRoute4 /{{a}}/b', func4);
			router.on('myRoute5 ?c=d&e=f', func5);
			router.on('myRoute6 #hash-{{hash}}', func6);

			// test 1 - positiv
			result = router.whoami('/');
			result.should.be.length(1);
			result[0].should.be.containEql({
				name: 'myRoute1',
				handler: func1,
				params: {},
				cache: false,
				fragment: '/'
			});

			// test 2 - positiv
			result = router.whoami('/some/path.html');
			result.should.be.length(1);
			result[0].should.be.containEql({
				name: 'myRoute2',
				handler: func2,
				params: {},
				cache: false,
				fragment: '/some/path.html'
			});

			// test 3 - positiv
			result = router.whoami('/some/123/4.34/path.html');
			result.should.be.length(1);
			result[0].should.be.containEql({
				name: 'myRoute3',
				handler: func3,
				params: {
					integer: 123,
					float:  4.34,
				},
				cache: false,
				fragment: '/some/123/4.34/path.html'
			});

			// test 4 - positiv
			result = router.whoami('/im/b?c=d&e=f#hash-tag');
			result.should.be.length(3);
			result[0].should.be.containEql({
				name: 'myRoute4',
				handler: func4,
				params: { a: 'im' },
				cache: false,
				fragment: '/im/b'
			});
			result[1].should.be.containEql({
				name: 'myRoute5',
				handler: func5,
				params: {},
				cache: false,
				fragment: '?c=d&e=f'
			});
			result[2].should.be.containEql({
				name: 'myRoute6',
				handler: func6,
				params: { hash: 'tag' },
				cache: false,
				fragment: '#hash-tag'
			});

			// test 3 - negativ
			router.whoami('/im/b/c').should.be.length(0);
			router.whoami('/unknown/path.html').should.be.length(0);

			// cleanup
			router.destroy();

		});

	});

	describe('which method', () => {

		it('it should return route information by passed name', () => {

			function func1(){}
			function func2(){}

			// setup
			let router = Router.create();
			router.on('myRoute1 /some/{{integer}}/{{float}}/path.html', func1);
			router.on('myRoute2 /a/b/c.html', func2);

			// test 1 - positiv
			router.which('myRoute1').should.be.containEql({
				name: 'myRoute1',
				type: 'dynamic',
				handler: func1,
				fragment: null,
				route: '/some/{{integer}}/{{float}}/path.html',
				urlpart: 'pathname',
				regex: '^\\/some\\/(?<integer>[\\d\\w?()|{}_.,-]+)\\/(?<float>[\\d\\w?()|{}_.,-]+)\\/path\\.html$',
				params: null,
				cache: false,
			});

			// test 2 - negativ
			should(router.which('unknownRoute')).be.exactly(null);

			// cleanup
			router.destroy();

		});

	});

	describe('_constructDynamicURL method', () => {

		it('should construct url by passt dynamic routename', () => {

			// setup
			let router = Router.create();

			// test 1
			router._constructDynamicURL('/person/{{name}}/{{surename}}/id/{{id}}',
				{ name: 'serkan', surename: 'sipahi', id: 333 }
			).should.equal('/person/serkan/sipahi/id/333');

			// test 2
			router._constructDynamicURL('?page={{page}}&id={{id}}',
				{ page: 'details', id: 999 }
			).should.equal('?page=details&id=999');

			// cleanup
			router.destroy();

		});

		it('should throw error if something gone wrong', () => {

			// setup
			let router = Router.create();

			// should throw if not params passed
			(() => { router._constructDynamicURL('/person/{{name}}') }).should.throw();

			// should throw if param is missing
			(() => { router._constructDynamicURL('/person/{{name}}', { id: 1 }) }).should.throw();

			// cleanup
			router.destroy();

		});

	});

	describe('_constructStaticURL method', () => {

		it('should return static url', () => {

			// setup
			let router = Router.create();

			// test 1
			router._constructStaticURL('/static/path/').should.equal('/static/path/');

			// cleanup
			router.destroy();

		});

	});

	describe('_constructURL method', () => {

		it('should call _constructStaticURL if static route passed', () => {

			// setup
			sinon.spy(Router.prototype, '_constructStaticURL');
			sinon.spy(Router.prototype, '_constructDynamicURL');
			let router = Router.create();
			router.on('myRoute /static/path',() => {});

			// test 1
			router._constructURL('myRoute');
			router._constructStaticURL.callCount.should.equal(1);
			router._constructDynamicURL.callCount.should.equal(0);

			// cleanup
			router.destroy();
			router._constructStaticURL.restore();
			router._constructDynamicURL.restore();

		});

		it('should call _constructDynamicURL if dynamic route passed', () => {

			// setup
			sinon.spy(Router.prototype, '_constructStaticURL');
			sinon.spy(Router.prototype, '_constructDynamicURL');
			let router = Router.create();
			router.on('myRoute /{{dynamic}}/{{path}}',() => {});

			// test 1
			router._constructURL('myRoute', { dynamic: 'hello', path: 'world' });
			router._constructStaticURL.callCount.should.equal(0);
			router._constructDynamicURL.callCount.should.equal(1);

			// cleanup
			router.destroy();
			router._constructStaticURL.restore();
			router._constructDynamicURL.restore();

		});

		it('should throw error if no route passed', () => {

			// setup
			let router = Router.create();

			// test 1
			(() => { router._constructURL() }).should.throw();

			// cleanup
			router.destroy();

		});

		it('should throw error if route not exists', () => {

			// setup
			let router = Router.create();

			// test 1
			(() => { router._constructURL('notExistsRoute') }).should.throw();

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

			// cleanup
			router.destroy();

		});

		it('should construct url by passed dynmic routename and params ', () => {

			// setup
			let router = Router.create();
			router.on('myRoute1 /{{static}}/path/{{id}}.html', () => {});

			// test 1
			router.constructURL('myRoute1', { static: 'foo', id:44 }).should.be.equal('/foo/path/44.html');
			router.constructURL('myRoute1', { static: 'bar', id:66 }).should.be.equal('/bar/path/66.html');

			// cleanup
			router.destroy();

		});

	});

	describe('go method', () => {

		it('should go by passed static routename', () => {

			//reset location.href
			history.pushState(null, null, '/');

			let router = Router.create();
			router.on('myRoute1 /some/static/path.html', () => {});
			sinon.spy(router, "pushState");

			// test 1
			router.go('myRoute1');

			let url = router.createURL(location.href);
			url.fragment.should.equal('/some/static/path.html');

			// test 2 - ingores params
			router.go('myRoute1', { a:1, b:2 });
			router.pushState.callCount.should.be.equal(2);

			router.pushState.restore();
			router.destroy();

		});

		it('should go by passed dynmic routename and params ', () => {

			//reset location.href
			history.pushState(null, null, '/');

			let router = Router.create();
			router.on('myRoute1 /{{static}}/{{id}}.html', () => {});
			sinon.spy(router, "pushState");

			// test 1
			router.go('myRoute1', { static: 'foo', id:44 });
			router.pushState.callCount.should.be.equal(1);

			let url = router.createURL(location.href);
			url.fragment.should.equal('/foo/44.html');

			router.pushState.restore();
			router.destroy();

		});

	});

	describe('redirect method', () => {

		it('description', () => {

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
			should(router.on('myRoute', (event) => {})).be.null();

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
			router.on('urlchange').then(({ thats }) => {
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
			router.on('Startpage /index.html', () => {});
			router.on('Resultpage /results.html', () => {});
			router.on('Detailpage /details.html', () => {});
			router.on('Configurator /configurator.html', () => {});

			// test routes count
			// INFO: _getRoutes umbenennen in getRoutes
			Object.keys(router._routes.pathname).should.be.length(4);

			// should throw error because route is already exists
			(() => { router.on('Detailpage /details.html', () => {}); }).should.throw();

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

		// Setup
		let router, spy_onUrlchange, spy_urlchange, element;

		beforeEach(() => {

			spy_onUrlchange = sinon.spy(Router.prototype, "_onUrlchange");
			spy_urlchange = sinon.spy(() => {});
			element = document.createElement("div");
			router = Router.create({
				scope: element,
				mode: {
					shadowRoute: true,
				},
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

		it('should call registered callback on element.click()', done => {

			(async () => {

			await $('.foo', element).clickAndWait(20);
			await $('.bar', element).clickAndWait(20);
			await $('.baz', element).clickAndWait(20);
			await $('.baz', element).clickAndWait(20);

            await delay(10);

			spy_urlchange.callCount.should.equal(3);

			spy_urlchange.args[0][0].fragment.should.equal('/index');
			spy_urlchange.args[1][0].fragment.should.equal('/index/details');
			spy_urlchange.args[2][0].fragment.should.equal('/index/details?a=1&b=2');

			done();

			})();

		});

		it('should call registered callback on router.back()', done => {

			(async () => {

			await $('.foo', element).clickAndWait(20);
			await $('.bar', element).clickAndWait(20);
			await $('.baz', element).clickAndWait(20);

			await history.backAndWait(50);
			await history.backAndWait(50);
			await history.backAndWait(50);

            await delay(10);

			spy_urlchange.args[0][0].fragment.should.equal('/index');
			spy_urlchange.args[1][0].fragment.should.equal('/index/details');
			spy_urlchange.args[2][0].fragment.should.equal('/index/details?a=1&b=2');
			spy_urlchange.args[3][0].fragment.should.equal('/index/details');
			spy_urlchange.args[4][0].fragment.should.equal('/index');

			done();

			})();

		});

	});

	describe('on method', () => {

		it('should match registered route on manually start() calling method', () => {

			let spy_home_handler = sinon.spy(() => {});

			// setup
			let router = Router.create({
				scope: document.createElement('div'),
			});

			router.pushState(null, null, '/');
			router.on('myRoute /', spy_home_handler);
			router.start();

			// test
			spy_home_handler.callCount.should.equal(1);

			// cleanup
			router.destroy();

		});

		it('should not match registered route on manually start() calling method', () => {

			let spy_home_handler = sinon.spy(() => {});

			// setup
			let router = Router.create({
				scope: document.createElement('div'),
			});

			router.pushState(null, null, '/');
			router.on('myRoute /a/b/c', spy_home_handler);
			router.start();

			// test
			spy_home_handler.callCount.should.equal(0);

			// cleanup
			router.destroy();

		});

	});

	describe('on method', () => {

		it('should match registered static and dynamic url route', done => {

			(async () => {

			// register events
			router.on('Index /index.html', spy_handler);
			router.on('SomePathURL /some/path/url.html', spy_handler);
			router.on('SomeDynamicURL /{{name}}/{{surname}}/123', spy_handler);
			router.on('Route1 /im/{{name}}', spy_handler);
			router.on('Route2 ?have=some', spy_handler);
			router.on('Route3 #hash-{{id}}', spy_handler);

			// trigger events by clicking
			await $('.index', element).clickAndWait(20);                   // +1 (Index)
			await $('.some-path-url', element).clickAndWait(20);           // +1 (SomePathURL)
			await $('.not-registered-url', element).clickAndWait(20);      // +0
			await $('.some-path-url', element).clickAndWait(20);           // +1 (SomePathURL)
			await $('.some-dynamic-path', element).clickAndWait(20);       // +1 (SomeDynamicURL)
			await $('.some-mixed-path', element).clickAndWait(20);         // +3 (Route1, Route2, Route3)
			await $('.some-partial-mixed-path', element).clickAndWait(20); // +1 (Route1)

			await delay(20);

			// callcount
			spy_handler.callCount.should.be.equal(8);

			// extract records
			let Index           = spy_handler.args[0][0];
			let SomePathURL_a   = spy_handler.args[1][0];
			let SomePathURL_b   = spy_handler.args[2][0];
			let SomeDynamicURL  = spy_handler.args[3][0];
			let Route1_a        = spy_handler.args[4][0];
			let Route2          = spy_handler.args[5][0];
			let Route3          = spy_handler.args[6][0];
			let Route1_b        = spy_handler.args[7][0];

			// Test: "Index" route
			Index.target.should.be.equal(element.querySelector('.index'));
			Index.should.be.containEql({
				type: 'static',
				name: 'Index',
				route: '/index.html',
				params: {},
				search: {},
				hash: {},
				cache: false,
			});


			// Test: "SomePathURL" route (first call)
			SomePathURL_a.target.should.be.equal(element.querySelector('.some-path-url'));
			SomePathURL_a.should.be.containEql({
				type: 'static',
				name: 'SomePathURL',
				route: '/some/path/url.html',
				params: {},
				search: {},
				hash: {},
				cache: false,
			});


			// Test: "SomePathURL" route (second call, from cache)
			SomePathURL_b.target.should.be.equal(element.querySelector('.some-path-url'));
			SomePathURL_b.should.be.containEql({
				type: 'static',
				name: 'SomePathURL',
				route: '/some/path/url.html',
				params: {},
				search: {},
				hash: {},
				cache: true,
			});


			// Test: "SomeDynamicURL1" route
			SomeDynamicURL.target.should.be.equal(element.querySelector('.some-dynamic-path'));
			SomeDynamicURL.should.be.containEql({
				type: 'dynamic',
				name: 'SomeDynamicURL',
				route: '/{{name}}/{{surname}}/123',
				params: {
					name: 'serkan',
					surname: 'sipahi'
				},
				search: {},
				hash: {},
				cache: false,
			});


			// Test: "Route1" route
			Route1_a.target.should.be.equal(element.querySelector('.some-mixed-path'));
			Route1_a.should.be.containEql({
				type: 'dynamic',
				name: 'Route1',
				route: '/im/{{name}}',
				params: {
					name: 'foo',
				},
				cache: false,
			});
			should(Route1_a.search).be.containEql({
				have: 'some',
				things: 'here',
			});
			should(Route1_a.hash).be.containEql({
				'hash-tag': null,
			});


			// Test: "Route2" route
			Route2.target.should.be.equal(element.querySelector('.some-mixed-path'));
			Route2.should.be.containEql({
				type: 'static',
				name: 'Route2',
				route: '?have=some',
				params: {},
				cache: false,
			});
			should(Route2.search).be.containEql({
				have: 'some',
				things: 'here',
			});
			should(Route2.hash).be.containEql({
				'hash-tag': null,
			});


			// Test: "Route2" route
			Route3.target.should.be.equal(element.querySelector('.some-mixed-path'));
			Route3.should.be.containEql({
				type: 'dynamic',
				name: 'Route3',
				route: '#hash-{{id}}',
				params: {
					id: 'tag'
				},
				cache: false,
			});
			should(Route3.search).be.containEql({
				have: 'some',
				things: 'here',
			});
			should(Route3.hash).be.containEql({
				'hash-tag': null,
			});


			// Test: "Route1" route
			Route1_b.target.should.be.equal(element.querySelector('.some-partial-mixed-path'));
			Route1_b.should.be.containEql({
				type: 'dynamic',
				name: 'Route1',
				route: '/im/{{name}}',
				params: {
					name: 'bar',
				},
				cache: false,
			});
			should(Route1_b.search).be.containEql({
				have: 'some',
				things: 'here',
			});
			should(Route1_b.hash).be.containEql({
				'hash-tag': null,
			});

			done();

			})();
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
		let element;
		let spy_handler;
		let router;

		beforeEach(() => {

			element = document.createElement("div");

			router = Router.create({
				scope: element,
			});

			spy_handler = sinon.spy(() => {});

			element.classList.add('anchor-container');
			element.innerHTML = `
				<a class="index" href="/index.html"> Index </a>
				<a class="some-path-url" href="/some/path/url.html"> Some path URL </a>
				<a class="some-dynamic-path" href="/serkan/sipahi/123"> Some Dynamic URL </a>
				<a class="some-mixed-path" href="/im/foo?have=some&things=here#hash-tag"> Some Mixed URL </a>
				<a class="some-partial-mixed-path" href="/im/bar?have=some&things=here#hash-tag"> Some Partial Mixed URL </a>
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

	describe('_getURLType', () => {

		it('should return route type by passed route', () => {

			// setup
			let router = Router.create();

			// test
			router._getURLType('/').should.be.equal('pathname');
			router._getURLType('/a/b.html').should.be.equal('pathname');
			router._getURLType('?a=1&b=2').should.be.equal('search');
			router._getURLType('#helloworld').should.be.equal('hash');

			// cleanup
			router.destroy();

		});

		it('should not return route type by passed route', () => {

			// setup
			let router = Router.create();

			// test
			should(router._getURLType('/a/b.html?a=1&b=2')).be.null();
			should(router._getURLType('?a/b.html#helloworld')).be.null();

			// cleanup
			router.destroy();

		});

	});

	describe('_isValidRoute', () => {

		it('should return true if route starts with "/,? or #"', () => {

			// setup
			let router = Router.create();

			// test
			router._isValidRoute('/').should.be.true();
			router._isValidRoute('/a/b.html').should.be.true();
			router._isValidRoute('?a=1&b=2').should.be.true();
			router._isValidRoute('#helloworld').should.be.true();

			// cleanup
			router.destroy();

		});

		it('should return false if route starts with "/,?,#" but also contain "/,?,#"', () => {

			// setup
			let router = Router.create();

			// test
			router._isValidRoute('/a/b.html?a=1&b=2').should.be.false();
			router._isValidRoute('?a/b.html#helloworld').should.be.false();

			// cleanup
			router.destroy();

		});

	});

	describe('off method', () => {

		it('should remove event by passed eventType', () => {

			// setup
			let spy_myRoute = sinon.spy(() => {});
			let router = Router.create({
				scope: document.createElement('div'),
			});

			router.on('myRoute /some/path.html', spy_myRoute);
			router.trigger('myRoute');

			// test that route remove from _routes
			Object.keys(router._routes.pathname).should.be.length(1);

			// test handler no more called
			router.off('myRoute');
			router.trigger('myRoute');
			spy_myRoute.callCount.should.be.equal(1);
			// test that route remove from _routes
			Object.keys(router._routes.pathname).should.be.length(0);

			// cleanup
			router.destroy();

		});

		it('should throw error if not eventType passed', () => {

			// setup
			let router = Router.create({
				scope: document.createElement('div'),
			});

			// test
			(() => { router.off() }).should.throw();

			// cleanup
			router.destroy();

		});

	});

	describe('destroy method', () => {

		it('should remove all registered events', () => {

			// setup
			let spy_myRoute1 = sinon.spy(() => {});
			let spy_myRoute2 = sinon.spy(() => {});
			let router = Router.create({
				scope: document.createElement('div'),
			});

			router.on('myRoute1 /some/path1.html', spy_myRoute1);
			router.on('myRoute2 /some/path2.html', spy_myRoute2);

			router.trigger('myRoute1');
			router.trigger('myRoute2');

			spy_myRoute1.callCount.should.be.equal(1);
			spy_myRoute2.callCount.should.be.equal(1);

			// test
			router.destroy();

			router.trigger('myRoute1');
			router.trigger('myRoute2');

			spy_myRoute1.callCount.should.be.equal(1);
			spy_myRoute2.callCount.should.be.equal(1);

			// cleanup
			router.destroy();

		});

	});

	describe('init method', () => {

		it('should init all registered events again if initialized with constructor', () => {

			// setup
			let spy_myRoute1 = sinon.spy(() => {});
			let spy_myRoute2 = sinon.spy(() => {});
			let scope = document.createElement('div');
			let routes = [
				['myRoute1 /some/path1.html', spy_myRoute1],
				['myRoute2 /some/path2.html', spy_myRoute2],
			];

			let router = Router.create({ routes, scope });

			// test 1
			router.destroy();
			router.trigger('myRoute1');
			router.trigger('myRoute2');

			spy_myRoute1.callCount.should.be.equal(0);
			spy_myRoute2.callCount.should.be.equal(0);

			// test 2 (reinit again)
			let config = Router.makeConfig({ routes, scope });
			router.reinit(config);

			router.trigger('myRoute1');
			router.trigger('myRoute2');

			spy_myRoute1.callCount.should.be.equal(1);
			spy_myRoute2.callCount.should.be.equal(1);

			// cleanup
			router.destroy();

		});

	});

	describe('create() function', () => {

		it('should bind scope to handlers', () => {

			class BindObject {
				x(){ this.y() }
				y(){}
			}
			// spies
			let spy_x = sinon.spy(BindObject.prototype, 'x');
			let spy_y = sinon.spy(BindObject.prototype, 'y');
			let spy_myRoute = sinon.spy(function() { this.x() });

			let bindObject = new BindObject();

			let router = Router.create({
				scope: document.createElement('div'),
				bind: bindObject,
			});

			router.on('myRoute /some/path.html', spy_myRoute);
			router.trigger('myRoute');

			// test
			spy_myRoute.callCount.should.be.equal(1);
			spy_x.callCount.should.be.equal(1);
			spy_y.callCount.should.be.equal(1);

			spy_myRoute.thisValues[0].should.be.equal(bindObject);

			// cleanup
			router.destroy();
			spy_x.restore();
			spy_y.restore();

		});

		it('should register many routes at once', () => {

			let spy_myRoute1 = sinon.spy(() => {});
			let spy_myRoute2 = sinon.spy(() => {});

			let router = Router.create({
				routes: [
					['myRoute1 /some/path/', spy_myRoute1],
					['myRoute2 /{{a}}/{{b}}/', spy_myRoute2],
				],
				scope: document.createElement('div'),
			});

			router.trigger('myRoute1');
			router.trigger('myRoute2', { a: 'hello', b: 'world' });

			//test
			spy_myRoute1.callCount.should.be.equal(1);
			spy_myRoute2.callCount.should.be.equal(1);
			spy_myRoute2.args[0][0].should.be.containEql({ a: 'hello', b: 'world' });

			router.destroy();

		});

		it('should register many routes at once + bindObject', () => {

			class BindObject {
				x(){ this.y() }
				y(){}
			}
			// spies
			let spy_x = sinon.spy(BindObject.prototype, 'x');
			let spy_y = sinon.spy(BindObject.prototype, 'y');
			let spy_myRoute1 = sinon.spy(function() { this.x() });

			let bindObject = new BindObject();

			let router = Router.create({
				routes: [
					['myRoute1 /{{a}}/{{b}}/', spy_myRoute1],
				],
				scope: document.createElement('div'),
				bind: bindObject,
			});

			router.trigger('myRoute1', { a: 'hello', b: 'world' });

			//test
			spy_myRoute1.callCount.should.be.equal(1);
			spy_x.callCount.should.be.equal(1);
			spy_y.callCount.should.be.equal(1);

			spy_myRoute1.thisValues[0].should.be.equal(bindObject);
			spy_myRoute1.args[0][0].should.be.containEql({ a: 'hello', b: 'world' });

			//cleanup
			router.destroy();
			spy_x.restore();
			spy_y.restore();

		});

	});
});
