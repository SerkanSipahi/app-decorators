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

#### Example
Input:
```css
    @on load {
        @fetch my/async/styles1.css;
        @fetch my/async/styles1.css;
    }
    .my-critical-path-selector {
        width: 100px;
        height: 100px;
    }
```
Output:
```js
let output = [
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
 ];
```


#### Tests
```bash
git clone https://github.com/SerkanSipahi/app-decorators.git
cd app-decorators/packages/postcss-parse-atrule-events
npm run test
```
