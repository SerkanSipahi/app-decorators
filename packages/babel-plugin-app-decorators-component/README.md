## babel-plugin-app-decorators-component
Babel Plugin for extend HTMLElement by options for Babeljs v6.x

<p>
    <a href="https://david-dm.org/SerkanSipahi/babel-plugin-app-decorators-component"><img src="https://david-dm.org/SerkanSipahi/david.svg" alt="Dependency Status"></a>
    <a href="https://david-dm.org/SerkanSipahi/babel-plugin-app-decorators-component/?type=dev"><img src="https://david-dm.org/SerkanSipahi/david/dev-status.svg" alt="devDependency Status"></a>
</p>

### Installation

```sh
$ npm install babel-plugin-app-decorators-component --save
```

### Usage

#### Via `.babelrc` (Recommended)

**.babelrc**

```json
{
  "plugins": ["app-decorators-component"]
}
```

#### Note: Order of Plugins Matters!
If you including your plugin `app-decorators-component`, make sure that `app-decorators-component` 
comes *before* all plugins or if you using `transform-decorators-legacy` before that.

```js
// WRONG
"plugins": [
    "plugin-1",
    "plugin-2",
    "plugin-3",
    "app-decorators-component"
]

// RIGHT
"plugins": [
    "app-decorators-component",
    "plugin-1",
    "plugin-2",
    "plugin-3"
]
```
See also notes: https://github.com/loganfsmyth/babel-plugin-transform-decorators-legacy

#### Via CLI

```sh
$ babel --plugins app-decorators-component script.js
```

#### Via Node API

```js
require('babel').transform('code', {
  plugins: ['app-decorators-component']
});
```

### The goal of this babel-plugin for app-decorators @component:

#### Example 1
code:
```js
@component()
class Helloworld {

}
```
transformed:
```js
@component()
class Helloworld extend HTMLElement {

}
```

#### Example 2
code:
```js
@component({
   extends: 'img'
})
class Helloworld {

}
```

transformed:
```js
@component({
   extends: 'img'
})
class Helloworld extends HTMLImageElement {
    static get extends() {
        return 'img';
    }
}
```

#### Not possible at the moment:
```js

class Bar {}

@component()
class Foo extends Bar {

}
```
#### Use dependency-Injection instead:
* https://en.wikipedia.org/wiki/Dependency_injection

#### Tests
```bash
git clone https://github.com/SerkanSipahi/babel-plugin-app-decorators-component.git
cd babel-plugin-app-decorators-component
make install
make test
```
