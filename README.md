## app-decorates (Beta)

#### Quickstart with app-decorators-cli
```sh
# For Mac
npm install appdec-cli-osx --global

# For Windows
npm install appdec-cli-win --global

# For Linux
npm install appdec-cli-linux --global

# then
appdec create --name mymodule
appdec run --name mymodule --watch --server
```

See [`app-decorators-cli`](https://github.com/SerkanSipahi/app-decorators-cli)(Beta)

---

#### Why app-decorators?
- compiler first
    - do at compile time and not at runtime
    - write less, do more

#### Runtime package

| Package | Version | Dependencies | DevDependencies |
|--------|-------|------------|------------|
| [`app-decorators`](https://github.com/SerkanSipahi/app-decorators) | [![npm](https://img.shields.io/npm/v/app-decorators.svg?maxAge=2592000)](https://www.npmjs.com/package/app-decorators) | [![Dependency Status](https://david-dm.org/SerkanSipahi/app-decorators.svg)](https://david-dm.org/SerkanSipahi/app-decorators) | [![DevDependency Status](https://david-dm.org/SerkanSipahi/app-decorators.svg?type=dev)](https://david-dm.org/SerkanSipahi/app-decorators?type=dev) |

#### Core packages

| Package | Version | Dependencies | DevDependencies |
|--------|-------|------------|------------|
| [`app-decorators-component`](/packages/babel-plugin-app-decorators-component) | [![npm](https://img.shields.io/npm/v/babel-plugin-app-decorators-component.svg?maxAge=2592000)](https://www.npmjs.com/package/babel-plugin-app-decorators-component) | [![Dependency Status](https://david-dm.org/SerkanSipahi/app-decorators.svg?path=packages/babel-plugin-app-decorators-component)](https://david-dm.org/SerkanSipahi/app-decorators?path=packages/babel-plugin-app-decorators-component) | [![DevDependency Status](https://david-dm.org/SerkanSipahi/app-decorators.svg?path=packages/babel-plugin-app-decorators-component&type=dev)](https://david-dm.org/SerkanSipahi/app-decorators?path=packages/babel-plugin-app-decorators-component&type=dev) |
| [`app-decorators-view-precompile`](/packages/babel-plugin-app-decorators-view-precompile) | [![npm](https://img.shields.io/npm/v/babel-plugin-app-decorators-view-precompile.svg?maxAge=2592000)](https://www.npmjs.com/package/babel-plugin-app-decorators-view-precompile) | [![Dependency Status](https://david-dm.org/SerkanSipahi/app-decorators.svg?path=packages/babel-plugin-app-decorators-view-precompile)](https://david-dm.org/SerkanSipahi/app-decorators?path=packages/babel-plugin-app-decorators-view-precompile) | [![DevDependency Status](https://david-dm.org/SerkanSipahi/app-decorators.svg?path=packages/babel-plugin-app-decorators-view-precompile&type=dev)](https://david-dm.org/SerkanSipahi/app-decorators?path=packages/babel-plugin-app-decorators-view-precompile&type=dev) |
| [`app-decorators-style-precompile`](/packages/babel-plugin-app-decorators-style-precompile) | [![npm](https://img.shields.io/npm/v/babel-plugin-app-decorators-style-precompile.svg?maxAge=2592000)](https://www.npmjs.com/package/babel-plugin-app-decorators-style-precompile) | [![Dependency Status](https://david-dm.org/SerkanSipahi/app-decorators.svg?path=packages/babel-plugin-app-decorators-style-precompile)](https://david-dm.org/SerkanSipahi/app-decorators?path=packages/babel-plugin-app-decorators-style-precompile) | [![DevDependency Status](https://david-dm.org/SerkanSipahi/app-decorators.svg?path=packages/babel-plugin-app-decorators-style-precompile&type=dev)](https://david-dm.org/SerkanSipahi/app-decorators?path=packages/babel-plugin-app-decorators-style-precompile&type=dev) |
| [`app-decorators-component-register`](/packages/babel-plugin-app-decorators-component-register) | [![npm](https://img.shields.io/npm/v/babel-plugin-app-decorators-component-register.svg?maxAge=2592000)](https://www.npmjs.com/package/babel-plugin-app-decorators-component-register) | [![Dependency Status](https://david-dm.org/SerkanSipahi/app-decorators.svg?path=packages/babel-plugin-app-decorators-component-register)](https://david-dm.org/SerkanSipahi/app-decorators?path=packages/babel-plugin-app-decorators-component-register) | [![DevDependency Status](https://david-dm.org/SerkanSipahi/app-decorators.svg?path=packages/babel-plugin-app-decorators-component-register&type=dev)](https://david-dm.org/SerkanSipahi/app-decorators?path=packages/babel-plugin-app-decorators-component-register&type=dev) |
| [`postcss-parse-atrule-events`](/packages/postcss-parse-atrule-events) | [![npm](https://img.shields.io/npm/v/postcss-parse-atrule-events.svg?maxAge=2592000)](https://www.npmjs.com/package/postcss-parse-atrule-events) | [![Dependency Status](https://david-dm.org/SerkanSipahi/app-decorators.svg?path=packages/postcss-parse-atrule-events)](https://david-dm.org/SerkanSipahi/app-decorators?path=packages/postcss-parse-atrule-events) | [![DevDependency Status](https://david-dm.org/SerkanSipahi/app-decorators.svg?path=packages/postcss-parse-atrule-events&type=dev)](https://david-dm.org/SerkanSipahi/app-decorators?path=packages/postcss-parse-atrule-events&type=dev) |
| [`preset-app-decorators`](/packages/babel-preset-app-decorators) | [![npm](https://img.shields.io/npm/v/babel-preset-app-decorators.svg?maxAge=2592000)](https://www.npmjs.com/package/babel-preset-app-decorators) | [![Dependency Status](https://david-dm.org/SerkanSipahi/app-decorators.svg?path=packages/babel-preset-app-decorators)](https://david-dm.org/SerkanSipahi/app-decorators?path=packages/babel-preset-app-decorators) | [![DevDependency Status](https://david-dm.org/SerkanSipahi/app-decorators.svg?path=packages/babel-preset-app-decorators&type=dev)](https://david-dm.org/SerkanSipahi/app-decorators?path=packages/babel-preset-app-decorators&type=dev) |

#### Command line tools (Cli) for Mac, Linux or Windows

| Package | Version | Dependencies | DevDependencies |
|--------|-------|------------|------------|
| [`appdec-cli-osx`](https://github.com/SerkanSipahi/app-decorators-cli) | [![npm](https://img.shields.io/npm/v/appdec-cli-osx.svg?maxAge=2592000)](https://www.npmjs.com/package/appdec-cli-osx) | [![Dependency Status](https://david-dm.org/SerkanSipahi/app-decorators-cli.svg?path=bin/osx)](https://david-dm.org/SerkanSipahi/app-decorators-cli?path=bin/osx) | [![DevDependency Status](https://david-dm.org/SerkanSipahi/app-decorators-cli.svg?path=bin/osx&type=dev)](https://david-dm.org/SerkanSipahi/app-decorators-cli?path=bin/osx&type=dev) |
| [`appdec-cli-win`](https://github.com/SerkanSipahi/app-decorators-cli) | [![npm](https://img.shields.io/npm/v/appdec-cli-win.svg?maxAge=2592000)](https://www.npmjs.com/package/appdec-cli-win) | [![Dependency Status](https://david-dm.org/SerkanSipahi/app-decorators-cli.svg?path=bin/win)](https://david-dm.org/SerkanSipahi/app-decorators-cli?path=bin/win) | [![DevDependency Status](https://david-dm.org/SerkanSipahi/app-decorators-cli.svg?path=bin/win&type=dev)](https://david-dm.org/SerkanSipahi/app-decorators-cli?path=bin/win&type=dev) |
| [`appdec-cli-linux`](https://github.com/SerkanSipahi/app-decorators-cli) | [![npm](https://img.shields.io/npm/v/appdec-cli-linux.svg?maxAge=2592000)](https://www.npmjs.com/package/appdec-cli-linux) | [![Dependency Status](https://david-dm.org/SerkanSipahi/app-decorators-cli.svg?path=bin/linux)](https://david-dm.org/SerkanSipahi/app-decorators-cli?path=bin/linux) | [![DevDependency Status](https://david-dm.org/SerkanSipahi/app-decorators-cli.svg?path=bin/linux&type=dev)](https://david-dm.org/SerkanSipahi/app-decorators-cli?path=bin/linux&type=dev) |

#### Todomvc

| Package | Version | Dependencies | DevDependencies |
|--------|-------|------------|------------|
| [`app-decorators-todomvc`](/packages/app-decorators-todomvc) | [![npm](https://img.shields.io/npm/v/app-decorators-todomvc.svg?maxAge=2592000)](https://www.npmjs.com/package/app-decorators-todomvc) | [![Dependency Status](https://david-dm.org/SerkanSipahi/app-decorators.svg?path=packages/app-decorators-todomvc)](https://david-dm.org/SerkanSipahi/app-decorators?path=packages/app-decorators-todomvc) | [![DevDependency Status](https://david-dm.org/SerkanSipahi/app-decorators.svg?path=packages/app-decorators-todomvc&type=dev)](https://david-dm.org/SerkanSipahi/app-decorators?path=packages/app-decorators-todomvc&type=dev) |

---

#### Simple example

##### Item.js
```js
import { component, view, on, action, style } from 'app-decorators';

@style(`
    /** These atrule (@) events will be loaded asynchronous (non blocking) **/
    
    /** will be loaded on load event **/
    @on load {
        @fetch path/to/on/load.css;
    }
    
    /** will be loaded when clicked .up class **/
    @on click .up {
        @fetch path/to/on/click/up.css;
    }

    /** will be loaded when url changed **/
    @action hello/my/friend.html {
        @fetch path/to/on/some/route/action.css;
    }

    /** critical path (inline css will appear immediately) **/
    my-box div {
        width: 100px;
        height: 100px;
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
        <a href="hello/my/friend.html">destroy</a>
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

## Tests and Contributors guidelines
```
// init
npm install --global lerna

// install and test packages
npm run lerna-bootstrap
make lerna-test

// install and compile for browser tests
make install
make compile

// browser tests
make test
```

app-decorators and its [packages](https://github.com/SerkanSipahi/app-decorators/tree/master/packages) are distributed as a [monorepo](https://github.com/babel/babel/blob/master/doc/design/monorepo.md).

## (c) 2015 - 2017 Serkan Sipahi
App-Decorators may be freely distributed under the [MIT license](https://github.com/SerkanSipahi/app-decorators/blob/master/LICENSE).
