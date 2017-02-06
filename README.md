## app-decorates

<p>
    <a href="https://david-dm.org/SerkanSipahi/app-decorators/?type=dev"><img src="https://david-dm.org/SerkanSipahi/david/dev-status.svg" alt="devDependency Status"></a>
</p>

##### Quickstart: 
Please use our [Todomvc Example](https://github.com/SerkanSipahi/app-decorators-todomvc) as boilerplate

## Simple example

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
    <div>{{count}}</div>
    <div>
        <span class="up"> + </span>
        <span class="down"> - </span>
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
            <div>0</div>
            <div>
                <span class="up"> + </span>
                <span class="down"> - </span>
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
