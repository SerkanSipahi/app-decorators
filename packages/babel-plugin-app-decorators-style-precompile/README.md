## babel-plugin-app-decorators-style-precompile
Babel Plugin for auto generating code

<p>
    <a href="https://david-dm.org/SerkanSipahi/app-decorators?path=packages/babel-plugin-app-decorators-style-precompile"><img src="https://david-dm.org/SerkanSipahi/david.svg" alt="Dependency Status"></a>
    <a href="https://david-dm.org/SerkanSipahi/app-decorators?path=packages/babel-plugin-app-decorators-style-precompile&type=dev"><img src="https://david-dm.org/SerkanSipahi/david/dev-status.svg" alt="devDependency Status"></a>
</p>

### Installation

```sh
$ npm install babel-plugin-app-decorators-style-precompile --save
```

### Usage

#### Via `.babelrc` (Recommended)

**.babelrc**

```json
{
  "plugins": ["app-decorators-style-precompile"]
}
```

**.babelrc options**
```js
"plugins": [
    ["app-decorators-style-precompile", {
        autoprefixer: "last 2 versions",
        minify: true
    }]
]
```

#### Via CLI

```sh
$ babel --plugins app-decorators-style-precompile script.js
```

#### Via Node API

```js
require('babel').transform('code', {
  plugins: ['app-decorators-style-precompile']
});
```

### The goal of this babel-plugin is precompile precomplie the stylesheet inside of @style:

#### Example
Input:
```js
@view(`
    // this will be loaded async on load event
    @media on('load') {
        @fetch my/async/styles1.css;
        @fetch my/async/styles1.css;
    }
    // this applied immediately
    .my-critical-path-selector {
        width: 100px;
        height: 100px;
    }
`)
class Foo {

}
```
Output:
```js
@view([
    {
        attachOn: "load",
        imports: [
            "my/async/styles1.css",
            "my/async/styles1.css"
        ],
        styles: "",
        type: "on",
    },
    {
        attachOn: "immediately",
        imports: [],
        styles: ".my-critical-path-selector { width: 100px; height: 100px; }",
        type: "default",
    },
])
class Foo {

}
```


#### Tests
```bash
git clone https://github.com/SerkanSipahi/app-decorators.git
cd app-decorators/packages/babel-plugin-app-decorators-style-precompile
make install
make test
```
