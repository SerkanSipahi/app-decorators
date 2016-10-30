## app-decorates
[![devDependency Status](https://david-dm.org/SerkanSipahi/app-decorators/dev-status.svg)](https://david-dm.org/SerkanSipahi/app-decorators?type=dev)

## Getting Started

```
npm install app-decorators --save
```

##### Mapping with systemjs
```
System.config({
	map : {
		"app-decorators": "node_modules/app-decorators/src/app-decorators",
	}
});
```

##### Item.js
```js
import { component, view, on } from 'app-decorators';

@component() // make sure @component is the first component
@view(`
	<h3>{{head}}</h3>
	<div>{{count}}</div>
	<div>
		<span class="up"> + </span>
		<span class="down"> - </span>
	</div>
`)
class Item {

	@view.bind count = 0;

	@on('click .up') onClickUp() {
	    ++this.count
	}

	@on('click .down') onClickUp() {
	    --this.count
	}

}

export {
    Item
}
```

#### app.js
```js

let item = Item.create({
	head: 'Some Head'
});

document.body.appendChild(item);

```

// or

#### Directly in markup
```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <title>my com-item</title>
    </head>
    <body>
        <com-item></com-item>
    </body>
</html>
```

### app-decorators works with Babel 6.x. Typescript is not tested
#### Usage

#### Via `.babelrc` (Recommended)

**.babelrc**

```json
{
    "presets": ["es2015"],
    "plugins": [
        "app-decorators-component",
        "transform-decorators-legacy",
        "transform-class-properties",
        "transform-function-bind"
    ]
}
```

#### Note: Order of Plugins Matters!
Make sure that `app-decorators-component` comes *before* `transform-decorators-legacy` before that.

WRONG:
```json

{
    "plugins": [
        "plugin-1",
        "plugin-2",
        "plugin-3",
        "app-decorators-component"
    ]   
}
```
RIGHT:
```json
{
    "plugins": [
        "app-decorators-component",
        "plugin-1",
        "plugin-2",
        "plugin-3"
    ]
}
```

## Todomvc

[Example](https://github.com/SerkanSipahi/app-decorators-todomvc)

## Documentation

##### Decorators
* [@component](./docs/decorators/component.md)
* [@view](./docs/decorators/view.md)
* [@on](./docs/decorators/on.md)
* [@action](./docs/decorators/action.md)
* [@style] : in progress
* [@model] : in progress

##### Libraries
* [Router](./docs/libs/router.md)
* [Customelement](./docs/libs/customelement.md)
* [Eventhandler](./docs/libs/eventhandler.md)
* [View](./docs/libs/view.md)
* Model : in progress


## Tests
```
make install
make compile
make test
```

(c) 2015 - 2016 Serkan Sipahi
App-Decorators may be freely distributed under the [MIT license](https://github.com/SerkanSipahi/app-decorators/blob/master/LICENSE).
