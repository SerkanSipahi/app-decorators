## postcss-parse-atrule-events
Postcss plugin for auto generating code

<p>
    <a href="https://david-dm.org/SerkanSipahi/app-decorators?path=packages/postcss-parse-atrule-events"><img src="https://david-dm.org/SerkanSipahi/david.svg" alt="Dependency Status"></a>
    <a href="https://david-dm.org/SerkanSipahi/app-decorators?path=packages/postcss-parse-atrule-events&type=dev"><img src="https://david-dm.org/SerkanSipahi/david/dev-status.svg" alt="devDependency Status"></a>
</p>

### Installation

```sh
$ npm install postcss-parse-atrule-events --save
```

### Usage

#### Via Node API

```js
let result = require('postcss-parse-atrule-events').parse('code');
```

### The goal of this babel-plugin is precompile template with handlebars that is inside of app-decorators @view:

#### Example
Input:
```js
let input =`
    @rel('preload') {
        @fetch load/my/styles2.css;
        @fetch load/my/styles3.css;
    }
    @on('load') {
        @fetch load/my111/styles2.css!async;
        @fetch load/my111/styles3.css!defer;
    }
    .foo {
        with: 200px;
        height: 200px;
    }
    .bar {
        color: red;
    }
`)
```
Output:
```js
let output = [
        {
            type: "rel",
            attachOn: "preload",
            styles: "",
            imports: [
                "load/my/styles2.css",
                "load/my/styles3.css"
            ]
            
        },
        {
            type: "on",
            attachOn: "load",
            styles: "",
            imports: [
                "load/my111/styles2.css!async",
                "load/my111/styles3.css!defer"
            ]
            
        },
        {
            type: "default",
            attachOn: "immediately",
            styles: `
                .foo {
                    with: 200px;
                    height: 200px;
                }
                .bar {
                    color: red;
                }
            `,
            imports: []
        }
    ]
```


#### Tests
```bash
git clone https://github.com/SerkanSipahi/app-decorators.git
cd app-decorators/packages/postcss-parse-atrule-events
npm run test
```
