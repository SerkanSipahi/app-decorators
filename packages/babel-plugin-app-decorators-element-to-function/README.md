## babel-plugin-app-decorators-element-to-function
Babel Plugin for auto generating code

<p>
    <a href="https://david-dm.org/SerkanSipahi/app-decorators?path=packages/app-decorators-element-to-function"><img src="https://david-dm.org/SerkanSipahi/david.svg" alt="Dependency Status"></a>
    <a href="https://david-dm.org/SerkanSipahi/app-decorators?path=packages/app-decorators-element-to-function&type=dev"><img src="https://david-dm.org/SerkanSipahi/david/dev-status.svg" alt="devDependency Status"></a>
</p>

### Installation

```sh
$ npm install app-decorators-element-to-function --save
```

### Usage

#### Via `.babelrc` (Recommended)

**.babelrc**

```json
{
  "plugins": ["app-decorators-element-to-function"]
}
```

**.babelrc options**
```js
"plugins": [
    ["app-decorators-element-to-function"]
]
```

#### Via CLI

```sh
$ babel --plugins app-decorators-element-to-function script.js
```

#### Via Node API

```js
require('babel').transform('code', {
  plugins: ['app-decorators-element-to-function']
});
```

### The goal of this babel-plugin is for app-decorators @component:

see also: https://github.com/babel/babel/issues/1548

#### Example 1
code:
```js
class Foo extends HTMLImageElement {
    
}
```

`app-decorators-helper/element-to-function.js`;
```js
let elementToFunction = Element => {
    if(typeof Element === 'function'){
        return Element;
    }
    
    let _Element = function(){};
    _Element.prototype = Element.prototype;
    return _Element;
    
};

export {
    elementToFunction as default
}

```


transformed:
```js
import _elementToFunc from 'app-decorators-helper/element-to-function';

class Foo extends _elementToFunc(HTMLImageElement) {

}
```

#### Tests
```bash
git clone https://github.com/SerkanSipahi/app-decorators.git
cd app-decorators/packages/app-decorators-element-to-function
make install
make test
```
