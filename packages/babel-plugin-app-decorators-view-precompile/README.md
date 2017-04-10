## babel-plugin-app-decorators-view-precompile
Babel Plugin for auto generating code

<p>
    <a href="https://david-dm.org/SerkanSipahi/app-decorators?path=packages/babel-plugin-app-decorators-view-precompile"><img src="https://david-dm.org/SerkanSipahi/david.svg" alt="Dependency Status"></a>
    <a href="https://david-dm.org/SerkanSipahi/app-decorators?path=packages/babel-plugin-app-decorators-view-precompile&type=dev"><img src="https://david-dm.org/SerkanSipahi/david/dev-status.svg" alt="devDependency Status"></a>
</p>

### Installation

```sh
$ npm install babel-plugin-app-decorators-view-precompile --save
```

### Usage

#### Via `.babelrc` (Recommended)

**.babelrc**

```json
{
  "plugins": ["app-decorators-view-precompile"]
}
```

**.babelrc options**
```js
"plugins": [
    ["app-decorators-view-precompile", {
        "engine": "handlebars"
    }]
]
```

#### Via CLI

```sh
$ babel --plugins app-decorators-view-precompile script.js
```

#### Via Node API

```js
require('babel').transform('code', {
  plugins: ['app-decorators-view-precompile']
});
```

### The goal of this babel-plugin is precompile template with handlebars that is inside of app-decorators @view:

#### Example
Input:
```js
@view(`
    {{#if foo}}<div>Hello World</div>
    {{else}}
        <div>Hello Mars</div>
    {{/if}}
`)
class Foo {

}
```
Output:
```js
@view({
    "1": function(container, depth0, helpers, partials, data) {
      return "<div>Hello World</div>\n";
    },
    "3": function(container, depth0, helpers, partials, data) {
      return "        <div>hello Mars</div>\n";
    },
    "compiler": [7, ">= 4.0.0"],
    "main": function(container, depth0, helpers, partials, data) {
      var stack1;
    
      return "\n    " + ((stack1 = helpers["if"].call(depth0 != null ? depth0 : {}, (depth0 != null ? depth0.foo : depth0), {
          "name": "if",
          "hash": {},
          "fn": container.program(1, data, 0),
          "inverse": container.program(3, data, 0),
          "data": data
      })) != null ? stack1 : "");
    },
    "useData": true
})
class Foo {

}
```


#### Tests
```bash
git clone https://github.com/SerkanSipahi/app-decorators.git
cd app-decorators/packages/babel-plugin-app-decorators-view-precompile
make install
make test
```
