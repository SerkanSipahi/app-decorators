## app-decorators-element-to-function
<p>
    <a href="https://david-dm.org/SerkanSipahi/app-decorators?path=packages/app-decorators-element-to-function"><img src="https://david-dm.org/SerkanSipahi/david.svg" alt="Dependency Status"></a>
    <a href="https://david-dm.org/SerkanSipahi/app-decorators?path=packages/app-decorators-element-to-function&type=dev"><img src="https://david-dm.org/SerkanSipahi/david/dev-status.svg" alt="devDependency Status"></a>
</p>

### Installation

```sh
$ npm install app-decorators-element-to-function --save
```

### Usage

### The goal of this babel-plugin is for app-decorators @component:
see: https://github.com/babel/babel/issues/1548

app-decorators-element-to-function.js:
```js
let elementToFunction = Element => {
    if(typeof Element === 'function'){
        return Element;
    }

    let _Element = function(){};
    _Element.prototype = Element.prototype;
    return _Element;

};
```

```js
import ElementToFunc from 'app-decorators-element-to-function';
class Foo extends ElementToFunc(HTMLImageElement) {
    
}
```
