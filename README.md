## app-decorates (Beta)

#### Quickstart with app-decorators-cli
```sh
appdec create my-module
appdec run --name=my-module --watch --server
```

See [`app-decorators-cli`](https://github.com/SerkanSipahi/app-decorators-cli)(Beta)

---

#### Runtime package

| Package | Version | Dependencies | DevDependencies |
|--------|-------|------------|------------|
| [`app-decorators`](https://github.com/SerkanSipahi/app-decorators) | [![npm](https://img.shields.io/npm/v/app-decorators.svg?maxAge=2592000)](https://www.npmjs.com/package/app-decorators) | [![Dependency Status](https://david-dm.org/SerkanSipahi/app-decorators.svg)](https://david-dm.org/SerkanSipahi/app-decorators) | [![DevDependency Status](https://david-dm.org/SerkanSipahi/app-decorators.svg?type=dev)](https://david-dm.org/SerkanSipahi/app-decorators?type=dev) |

#### core packages

| Package | Version | Dependencies | DevDependencies |
|--------|-------|------------|------------|
| [`app-decorators-component`](/packages/babel-plugin-app-decorators-component) | [![npm](https://img.shields.io/npm/v/babel-plugin-app-decorators-component.svg?maxAge=2592000)](https://www.npmjs.com/package/babel-plugin-app-decorators-component) | [![Dependency Status](https://david-dm.org/SerkanSipahi/app-decorators.svg?path=packages/babel-plugin-app-decorators-component)](https://david-dm.org/SerkanSipahi/app-decorators?path=packages/babel-plugin-app-decorators-component) | [![DevDependency Status](https://david-dm.org/SerkanSipahi/app-decorators.svg?path=packages/babel-plugin-app-decorators-component&type=dev)](https://david-dm.org/SerkanSipahi/app-decorators?path=packages/babel-plugin-app-decorators-component&type=dev) |
| [`app-decorators-component-register`](/packages/babel-plugin-app-decorators-component-register) | [![npm](https://img.shields.io/npm/v/babel-plugin-app-decorators-component-register.svg?maxAge=2592000)](https://www.npmjs.com/package/babel-plugin-app-decorators-component-register) | [![Dependency Status](https://david-dm.org/SerkanSipahi/app-decorators.svg?path=packages/babel-plugin-app-decorators-component-register)](https://david-dm.org/SerkanSipahi/app-decorators?path=packages/babel-plugin-app-decorators-component-register) | [![DevDependency Status](https://david-dm.org/SerkanSipahi/app-decorators.svg?path=packages/babel-plugin-app-decorators-component-register&type=dev)](https://david-dm.org/SerkanSipahi/app-decorators?path=packages/babel-plugin-app-decorators-component-register&type=dev) |
| [`app-decorators-view-precompile`](/packages/babel-plugin-app-decorators-view-precompile) | [![npm](https://img.shields.io/npm/v/babel-plugin-app-decorators-view-precompile.svg?maxAge=2592000)](https://www.npmjs.com/package/babel-plugin-app-decorators-view-precompile) | [![Dependency Status](https://david-dm.org/SerkanSipahi/app-decorators.svg?path=packages/babel-plugin-app-decorators-view-precompile)](https://david-dm.org/SerkanSipahi/app-decorators?path=packages/babel-plugin-app-decorators-view-precompile) | [![DevDependency Status](https://david-dm.org/SerkanSipahi/app-decorators.svg?path=packages/babel-plugin-app-decorators-view-precompile&type=dev)](https://david-dm.org/SerkanSipahi/app-decorators?path=packages/babel-plugin-app-decorators-view-precompile&type=dev) |
| [`preset-app-decorators`](/packages/babel-preset-app-decorators) | [![npm](https://img.shields.io/npm/v/babel-preset-app-decorators.svg?maxAge=2592000)](https://www.npmjs.com/package/babel-preset-app-decorators) | [![Dependency Status](https://david-dm.org/SerkanSipahi/app-decorators.svg?path=packages/babel-preset-app-decorators)](https://david-dm.org/SerkanSipahi/app-decorators?path=packages/babel-preset-app-decorators) | [![DevDependency Status](https://david-dm.org/SerkanSipahi/app-decorators.svg?path=packages/babel-preset-app-decorators&type=dev)](https://david-dm.org/SerkanSipahi/app-decorators?path=packages/babel-preset-app-decorators&type=dev) |

#### todomvc

| Package | Version | Dependencies | DevDependencies |
|--------|-------|------------|------------|
| [`app-decorators-todomvc`](/packages/app-decorators-todomvc) | [![npm](https://img.shields.io/npm/v/app-decorators-todomvc.svg?maxAge=2592000)](https://www.npmjs.com/package/app-decorators-todomvc) | [![Dependency Status](https://david-dm.org/SerkanSipahi/app-decorators.svg?path=packages/app-decorators-todomvc)](https://david-dm.org/SerkanSipahi/app-decorators?path=packages/app-decorators-todomvc) | [![DevDependency Status](https://david-dm.org/SerkanSipahi/app-decorators.svg?path=packages/app-decorators-todomvc&type=dev)](https://david-dm.org/SerkanSipahi/app-decorators?path=packages/app-decorators-todomvc&type=dev) |

---

#### Simple example

##### Item.js
```js
import { component, view, on, action, style } from 'app-decorators';

@style(`
    my-box h3 {
        font-size: 14px;
    }
    my-box div {
        border: 1px solid gray;
    }
`)
@view(`
    <h3>{{head}}</h3>
    <div class="count">{{count}}</div>
    <div>
        <span class="up"> + </span>
        <span class="down"> - </span>
    </div>
    <div>
        <a href="?state=reset">clear count</a>
        <a href="?state=destroy">destroy</a>
    </div>
`)
@component({
    name: 'my-box'
})
class Item {

    @view.bind count = 0;
    
    @on('click .up') onClickUp() {
        ++this.count
    }
    
    @on('click .down') onClickUp() {
        --this.count
    }
    
    @action('?state={{type}}') onUrlStateChanged({ params }){
        
        let { type } = params;
        if(type === 'reset'){
            this.count = 0;   
        }
        // remove it self
        else if(type === 'destroy') {
            this.parentNode.removeChild(this);
        }
    }
}

export {
    Item
}
```

#### app.js
```js

let item = Item.create({
    head: 'Some description'
});

document.body.appendChild(item);
```

#### Result in Markup
```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <title>my com-item</title>
    </head>
    <body>
        <com-item>
            <!-- for fast rendering, style will be appended onLoad -->
            <style>
                my-box h3 {
                    font-size: 14px;
                }
                my-box div {
                    border: 1px solid gray;
                }
            </style>
            <h3>Some description</h3>
            <div class="count">0</div>
            <!-- on click .up or .down it will increment/decrement .count -->
            <div>
                <span class="up"> + </span>
                <span class="down"> - </span>
            </div>  
            <div>
                <a href="?state=reset">clear count</a>
                <a href="?state=destroy">destroy</a>
            </div>
        </com-item>
    </body>
</html>
```

#### Its also possible to put `<com-item></com-item>` direct in the dom like:
```html
<body>
    <!-- It will render, see above (result in markup) -->
    <com-item></com-item>
</body>
```

## Documentation

##### Decorators
* [@component](./docs/decorators/component.md)
* [@view](./docs/decorators/view.md)
* [@on](./docs/decorators/on.md)
* [@action](./docs/decorators/action.md)
* [@style](./docs/decorators/style.md)

##### Libraries
* [Router](./docs/libs/router.md)
* [Customelement](./docs/libs/customelement.md)
* [Eventhandler](./docs/libs/eventhandler.md)
* [View](./docs/libs/view.md)
* [Stylesheet](./docs/libs/stylesheet.md)

## Tests
```
// 1.0) init
make install
npm run lerna-bootstrap

// 1.1) optional: watch test
make compile

// 3.1) browser test
make test

// 3.2) packages test
make lerna-test
```

## Source

app-decorators and its [packages](https://github.com/SerkanSipahi/app-decorators/tree/master/packages) are distributed as a [monorepo](https://github.com/babel/babel/blob/master/doc/design/monorepo.md).

## (c) 2015 - 2017 Serkan Sipahi
App-Decorators may be freely distributed under the [MIT license](https://github.com/SerkanSipahi/app-decorators/blob/master/LICENSE).
