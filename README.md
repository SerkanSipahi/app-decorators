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

##### If you use app-decorators with Babeljs, Typescript(not tested) or an other compiler you need following features:
```
class-properties
decorators
function-bind
es2015
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
