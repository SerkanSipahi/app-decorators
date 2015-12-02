## app-decorators.js (v0.3)
[![devDependency Status](https://david-dm.org/SerkanSipahi/app-decorators/dev-status.svg)](https://david-dm.org/SerkanSipahi/app-decorators#info=devDependencies)

>Collection of useful ES7 Decorators that can be used for building webapps

## Getting Started

with npm
```
npm install app-decorators --save
```
or git
```
git clone https://github.com/SerkanSipahi/app-decorators.git
```

Mapping with systemjs
```
System.config({
	map : {
		"app-decorators": "node_modules/app-decorators/src/app-decorators",
	}
});
```

or jspm (no mapping required it do it automatically)
```
jspm install npm:app-decorators
```

## Info
>If you want to use this library you need an environment that support ES6 and ES7

This library can be consumed by any transpiler that supports decorators like babel.js or using the recent iterations of TypeScript. To use with babel, you must include the correct babel plugins for decorator parsing and transformation or use stage-1. Babel 6 does not yet support decorators, use Babel 5 until that is fixed [ Source of the statement:  [core-decorators](https://github.com/jayphelps/core-decorators.js) ]

## Decorators

##### For Classes, Functions and Methods
* [@component](#component)
* [@view](#view) : in progress
* [@on](#on) : in progress
* [@style](#style) : in progress
* [@model](#model) : in progress
* [@modelpool](#modelpool) : in progress
* [@router](#router) : in progress

## Documentation

### @component [ new ] (can be used)

##### Description
```js
@component();
class Foo {
}

let foo = Foo.instance();
// if no Element passed default is HTMLElement
console.log(foo instanceof HTMLElement) // logs true
```

>"Tests success" natively (CustomElements) in Chrome 46, Firefox 42 and Opera 33

>For browsers that are not supporting natively `CustomElements` see this polyfill: [document-register-element](https://github.com/WebReflection/document-register-element)

##### Usage
```js
import { component } from 'app-decorators';

class Data {
    foo(){
        return 'Hello World';
    }
}

// It can be passed any DOM-Class! Default is HTLMElement
@component(HTMLElement)
class Item extends Data {
    createdCallback() {
        this.$foo = this.foo();
    }
    attachedCallback() {
        this.innerHTML = this.$foo;
    }
    attributeChangedCallback(attrName, oldVal, newVal) {
    }
    detachedCallback() {
    }
}
```

##### Instructions for manual instantiation:
```js

// creating custom-element
let item1 = Item.instance();
let item2 = Item.instance();

// log true
console.log(item instanceof HTMLElement);
console.log(item instanceof Element);

document.body.appendChild(item1);
document.body.appendChild(item2);

/**
<body>
    <com-item>Hello World</com-item>
    <com-item>Hello World</com-item>
</body>
**/

```

##### Instructions for automatic instantiation:

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8" />
        <meta http-equiv="x-ua-compatible" content="ie=edge, chrome=1" />
        <title>@component</title>
    </head>
    <body>
        <!-- put your "components" anywhere in html document -->
        <com-item></com-item>
        <com-item></com-item>
    </body>
</html>
```

##### Instructions for using only in ES5 environment
(available at app-decorators >= v1.0)
* This can be used at `app-decorators >=0.3` however you have to
transpile the code `src/libs/customelement.js` by your self in the shell

```
babel src/libs/customelement.js --out-file dist/component.js --modules common --stage 0
```

```
make build module=amd    // for using with requirejs
// or
make build module=common // for using with node
```

##### Description
```js
let Foo: HTMLElement = CustomElement.register(Foo: Function, Element = HTMLElement);
// if no Element passed as last parameter default is HTMLElement
console.log(Foo.prototype instanceof HTMLElement) // logs true
```
```js

var CustomElement = require('src/libs/customelement');

function Item(){}
Item.prototype.a = function(){};
Item.prototype.b = function(){};
Item.prototype.c = function(){};
Item.prototype.createdCallback = function() {}
Item.prototype.attachedCallback = function() {}
Item.prototype.attributeChangedCallback = function(attrName, oldVal, newVal) {}
Item.prototype.detachedCallback = function() {}

CustomElement.register(Item, HTMLElement);
var item = Item.instance();
document.body.appendChild(item);
```

### @view [ in progress/planing ]
```js
import { component, view } from 'app-decorators';

@view(`
    <div class="{{a}}">{{a}}</div>
    <div class="{{b}}">{{b}}</div>
    <div class="{{c}}">{{c}}</div>
`)

@component(HTMLElement)
class Item {

    @view.bind a;
    @view.bind b;
    @view.bind c = 'delete';

    createdCallback(){
        this.a = 'add';
        this.b = 'edit';
    }
}

let item = Item.instance();
document.body.appendChild(item);
```
```html
<body>
    <!-- output -->
    <com-item>
        <div class="add">add</div>
        <div class="edit">edit</div>
        <div class="delete">delete</div>
    </com-item>
</body>
```

### @on [ in progress/planing ]
```js
import { component, view, on } from 'app-decorators';

@view(`
    <div class="add">add</div>
    <div class="edit">edit</div>
    <div class="delete">delete</div>
`)

@component(HTMLElement)
class Item {

    @on('click .add') addItem( self ){
        console.log('on click .add');
    }
    @on('click .edit') editItem( self ){
        console.log('on click .edit');
    }
    @on('click .delete') deleteItem( self ){
        console.log('on click .add');
    }

}

let item = Item.instance();
document.body.appendChild(item);
```
```html
<body>
    <!-- output -->
    <com-item>
        <div class="add">add</div>
        <div class="edit">edit</div>
        <div class="delete">delete</div>
    </com-item>
</body>
```

### @model [ in progress/planing ]
```js
// components/item.js
import { component, view, model } from 'app-decorators';

@view(`
    <div class="name">{{name}}</div>
    <div class="city">{{city}}</div>
    <div class="country">{{country}}</div>
`)

@component(HTMLElement)
class Item {

    @model.attr @view.bind name;
    @model.attr @view.bind city;
    @model.attr @view.bind country = 'Turkey';

    createdCallback(){
        this.name = 'Serkan';
        this.city = 'Istanbul';
    }

    @model('read:name') read( value ) {
        this.name = `${value} [ read ]`;
    }
    @model('update:name') updateName( value ) {
        this.name = `${value} [ update ]`;
    }
    @model('update:city') updateCity( value ) {
        this.city = `${value} [ update ]`;
    }
    @model('delete:country') delete( ) {
        this.country = '-';
    }

}

let item = Item.instance();
document.body.appendChild(item);

/**
// output
<com-item>
    <div class="name">Serkan</div>
    <div class="city">Istanbul</div>
    <div class="country">Turkey</div>
</com-item>
 */

```
```js
// ...somewhere in another file

let item = document.querySelector('com-item');
item.model.set('name', 'Ayil');

/**
// output
<com-item>
    <div class="name">Ayil [ update ]</div>
    <div class="city">Istanbul</div>
    <div class="country">Turkey</div>
</com-item>
 */
```

or with

### @modelpool [ in progress/planing ]
```js

import { component, on, modelpool } from 'app-decorators';

@modelpool
@component(HTMLButtonElement)
class SpecialButton {
    createdCallback(){
        this.setAttribute('type', 'submit');
        this.innerHTML = 'Click me!';
    }
    @on('submit') submit(){
        let item = this.modelpool.get('item');
        item.model.set('name', 'serkan');
    }
}

/**
// on submit
<com-specialbutton type="submit">Click me!</specialbutton>

// it changed to "serkan [ update ]"

<com-item>
    <div class="name">Serkan [ update ]</div>
    <div class="city">Istanbul</div>
    <div class="country">Turkey</div>
</com-item>
 */

```

### @style
```js
// in progress
```

### @router
```js
// in progress
```

## Tests
```
make install
make test
```
