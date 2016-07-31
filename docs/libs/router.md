### Getting Started

#### app-decorators is required
```
npm install app-decorators --save
```

#### Mapping with systemjs
```
System.config({
	map : {
		"app-decorators": "node_modules/app-decorators/src/app-decorators",
	}
});
```

#### Why this Router?
* add path, search or hash routes separately
* caches matched routes
* no unnecessary handler calls
* event driven
* useful public methods
* no vendor libraries
* written in ES6
* test driven
* performance written

#### import Router:
```js
import { Router } from 'app-decorators';
```

#### basic usage:
```js

let router = Router.create();

// add path route
router.on('Home /', () => {
    console.log('home');
});

// ** if exists, search and hash will be always passed **
router.on('Results /products/{{category}}.html', (matched, search, hash) => {

    console.log(matched.params.category);
});

// ** if exists, search and hash will be always passed **
router.on('Product /products/{{category}}/{{id}}.html', (matched, search, hash) => {

    console.log(matched.params.category);
	console.log(matched.params.id);
});

// add search route
router.on('ShowArea ?show={{type}}', (matched, search, hash) => {

    console.log(matched.params.type);
});

// add hash route
router.on('MarkLines #markfrom={{from}}&to={{to}}', (matched, search, hash) => {

	console.log(matched.params.from);
	console.log(matched.params.to);
});

// start route
router.start();
```

#### index.html
```html
    <a class="home" href="/"> Home </a>
    <a class="results" href="/products/samsung/s4"> Samsung Galaxy S4 </a>
    <a class="show-video" href="/products/samsung/s4?show=video"> Show Video </a>
    <a class="show-hightlight"href="/products/samsung/s4?show=video#markfrom=5&to=10"> Show Highlight </a>
</html>
```

#### advanced usage:
```js
/**
 * register all routes at once
 */
let router = Router.create({
	routes: {
		'Home /': () => {},
		'Results /products/{{category}}.html': () => {},
		'Product /products/{{category}}/{{id}}.html': () => {},
	},
});
```

```js
/**
 * bind property object to handler
 */
class Foo() {
	fooMethod(name){
		console.log(`Hello ${name}`) // log: hello foo
	}
}

let foo = new Foo();

let router = Router.create({
	routes: {
		'Home /': () => {},
		'Results /products/{{category}}.html': () => {

			// with the bind property (see below)
			// you have direct access to Foo instance
			this.fooMethod('foo');
		}
	},
	bind: foo // <=
});
```

```js
/**
 * scope your routes
 */
let navigation = document.querySelector('navigation');

let router = Router.create({
	routes: {
		'Home /': () => {},
		'Results /products/{{category}}.html': () => {}
	},

	// Info: scope must be an instanceof HTMLElement
	// Now your routes will be only performe in <navigation>.
	scope: navigation
});
```

```js
/**
 * shadow your routes like shadowDom with shadowRoute
 */

// example coming soon
```

#### public methods:
```js
/**
 * on method (register your routes)
 */
let router = Router.create();

router.on('myRoute1 /my/path/{{name}}', () => {});

// if you not pass a handler, the
// router will be return a promise
let promise = router.on('myRoute2 ?name={{name}}');

promise
	.then((matched) => {
		return matched.params.name;
	})
	.then((value) => {
		console.log(value) // log: baz
	});
```

```js
/**
 * Alternate to on method
 * addRouteListener method (register your routes)
 */
let router = Router.create();

router.addRouteListener('myRoute1', '/my/path/{{name}}', () => {});
router.addRouteListener('myRoute2', '?name=foo', () => {});
```

```js
/**
 * trigger method (manuel triggering )
 */
let router = Router.create();

router.on('myRoute1 /my/path/{{name}}', () => {});
router.on('myRoute2 ?name=foo', (matched, search, hash) => {

	// ** if exists, search and hash will be always passed **
	console.log(matched.params.hello) // log: 'world'
});

// trigger
router.trigger('myRoute2');

// trigger with args
router.trigger('myRoute2', { hello: 'world' });
```

```js
/**
 * firing event natively
 */
let router = Router.create({
	scope: document.body
});

// register routes
router.on('route1 /', () => {});
router.on('route2 /some/{{name}}.html', (matched, search, hash) => {

	// ** if exists, search and hash will be always passed **
	console.log(matched.params.name); // log: path
});

// create CustomEvent
let event = new CustomEvent('route2', {
	detail: {
		name: 'path'
	}
});

// trigger event
document.body.dispatchEvent(event);
```

```js
/**
 * match method (manuel matching, without over clicking a-tag )
 */
let router = Router.create();

router.on('myRoute1 /my/path/{{name}}', (matched, search, hash) => {
	console.log(matched.params) // log: { name: 'awesome' }
	console.log(search) // log: { a:1, b:2 }
	console.log(hash)   // log: { c:3, d:4 }
});

// will match
router.match('/my/path/awesome?a=1&b=2#c=3&d=4');

// will match and cache (see optional "true" paramter)
router.match('/my/path/link', true);

// will not match (is not registered)
router.match('/your/path/awesome');
```

```js
/**
 * whoami method (return who is/are passed in fragment)
 */
let router = Router.create();

router.on('myRoute1 /my/path/{{name}}', () => {});
router.on('myRoute2 ?hello=world', () => {});
router.on('myRoute3 #hash=tag', () => {});

// will match
let matched = router.whoami('/my/path/awesome#hash=tag');

// will log:
console.log(matched);
[{
	'/my/path/{{name}}': {
		name: 'myRoute1',
		type: 'dynamic',
		route: '/my/path/{{name}}',
		urlpart: 'pathname',
		regex: '^\\/this\\/path\\/(?<name>[\\d\\w?()|{}_.,-]+)$',
		params: {
			name: 'awesome'
		},
		fragment: '/my/path/awesome',
		cache: false,
	},
},
{
	'#hash=tag': {
		name: 'myRoute3',
		type: 'static',
		route: '#hash=tag',
		urlpart: 'hash',
		regex: '#hash=tag',
		params: {},
		fragment: '#hash=tag',
		cache: false,
	},
}]
```

```js
/**
 * which method (return who is passed routename)
 */
let router = Router.create();

router.on('myRoute1 /my/path/{{name}}', () => {});
router.on('myRoute2 ?hello=world', () => {});
router.on('myRoute3 #hash=tag', () => {});

// will match
let which = router.which('myRoute1');

// will log:
console.log(which);
{
	'/my/path/{{name}}': {
		name: 'myRoute1',
		type: 'dynamic',
		route: '/my/path/{{name}}',
		urlpart: 'pathname',
		regex: '^\\/this\\/path\\/(?<name>[\\d\\w?()|{}_.,-]+)$',
		params: null,
		fragment: null,
		cache: false,
	}
}
```

```js
/**
 * constructURL method (will build an url)
 */
let router = Router.create();

router.on('myRoute1 /some/static/path.html', () => {});
router.on('myRoute2 /{{static}}/path/{{id}}.html', () => {});

// build url for myRoute1
let url1 = router.constructURL('myRoute1');
console.log(url1) // log: /some/static/path.html

// build url for myRoute2
let url2 = router.constructURL('myRoute2', { static: 'foo', id:44 });
console.log(url1) // log: /foo/path/44.html
```

```js
/**
 * go method (build url and redirect to)
 */
let router = Router.create();

router.on('myRoute1 /some/static/path.html', () => {});
router.on('myRoute2 /{{static}}/path/{{id}}.html', (matched, search, hash) => {
	console.log(matched.params) // log: { static: 'foo', id:44 }
});

router.go('myRoute2', { static: 'foo', id:44 });
```

```js
/**
 * start/stop method (will start the router)
 */
let router = Router.create();

router.on('myRoute1 /some/static/path.html', () => {});
router.on('myRoute2 /{{static}}/path/{{id}}.html', () => {});

router.start(); // will start the router

router.stop(); // will stop the router

```

```js
/**
 * off method (remove your routes)
 */
let router = Router.create();

router.on('myRoute1 /my/path/1', () => {});
router.on('myRoute2 /my/path/2', () => {});
router.on('myRoute3 /my/path/3', () => {});

// will remove myRoute1
router.off('myRoute1');

// will remove all routes (not implemented yet)
router.off();
```

```js
/**
 * destroy method (will kill your router instance)
 */
let router = Router.create();

router.on('myRoute1 /my/path/1', () => {});
router.on('myRoute2 /my/path/2', () => {});
router.on('myRoute3 /my/path/3', () => {});

router.destroy();
```

#### troubleshooting:
```js
let router = Router.create();

// This is not possible, it throw an Error.
// You can pass pathname (/a/b.html), search (?c=d&e=f) or hash(#g=h&i=j)
// separately like above
router.on('AllInOne /a/b?c=d&e=f#g=h&i=j', () => {});

```

#### Tests:
```
make install
make compile
make test
```

(c) 2015 - 2016 Serkan Sipahi
App-Decorators may be freely distributed under the [MIT license](https://github.com/SerkanSipahi/app-decorators/blob/master/LICENSE).
