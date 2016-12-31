## app-decorates

<p>
    <a href="https://david-dm.org/SerkanSipahi/app-decorators/?type=dev"><img src="https://david-dm.org/SerkanSipahi/david/dev-status.svg" alt="devDependency Status"></a>
</p>


## Getting Started

```
npm install app-decorators babel-preset-app-decorators@1.0.0-beta.1 --save
npm install babel-preset-es2015 --save-dev
```

#### Usage

#### Via `.babelrc` (Recommended)

**.babelrc**

```json
{
    "presets": ["es2015", "app-decorators"]
}
```

##### How to start (quickstart): 
Please use for the first the [TodoMvc Example](https://github.com/SerkanSipahi/app-decorators-todomvc) as boilerplate

##### Item.js
```js
import { component, view, on } from 'app-decorators';

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

(c) 2015 - 2017 Serkan Sipahi
App-Decorators may be freely distributed under the [MIT license](https://github.com/SerkanSipahi/app-decorators/blob/master/LICENSE).
