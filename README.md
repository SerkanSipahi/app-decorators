## Decorate.js
[![devDependency Status](https://david-dm.org/SerkanSipahi/app-decorators/dev-status.svg)](https://david-dm.org/SerkanSipahi/app-decorators#info=devDependencies)

## Getting Started

```
npm install app-decorators --save
```

Mapping with systemjs
```
System.config({
	map : {
		"app-decorators": "node_modules/app-decorators/src/app-decorators",
	}
});
```

## Decorators

##### For Classes, Functions and Methods
* [@component](#component)
* [@view](#view)
* [@on](#on)
* [@style](#style) : in progress
* [@model](#model) : in progress
* [@modelpool](#modelpool) : in progress
* [@router](#router) : in progress

## Documentation

### @component

##### Basic usage:
```js
import { component } from 'app-decorators';


@component()
class Item {

	interval = null;
	// default properties
	prefix = 'Hello';
	suffix = 'World!';

	$ = ::document.querySelector;

    created() {
        this.innerHTML = `
			<style scoped>
				p {
					transition: color 200ms ease;
				}
				p.blink {
					color:transparent;
				}
			</style>
			<p>${this.prefix} ${this.suffix}</p>
		`;
    }

	blink(ms = 300){

		// return on recalling blink
		if(this.timeout){
			return;
		}

		// 'blink' class is toggled into 'p' tag between the interval of 500 ms
		this.interval = setInterval(() => {
			this.$('p').classList.toggle('blink');
		}, ms);

	}

	stop(){
		clearTimeout(this.interval);
	}

}
```
now put this this in your html page e.g. body
```html
<com-item></com-item>
```
and it will rendered to that:

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8" />
        <meta http-equiv="x-ua-compatible" content="ie=edge, chrome=1" />
        <title>@component</title>
    </head>
    <body>
        <!-- this will be rendered -->
        <com-item>
			<p>Hello World</p>
		</com-item>
    </body>
</html>
```
or directly with javascript
```js

// creating domNode
let item1 = Item.create();

console.log(item1 instanceof HTMLElement); // log true

document.body.appendChild(item1);

// will rendered:
/**
<body>
    <com-item>
		<p>Hello World</p>
	</com-item>
</body>
**/

// it will blink every 500ms
item1.blink(500);

// or if node already exists in dom
document.querySelector('com-item').blink(500);

// it will stop blinking after 20 seconds
setTimeout(() => {
	item1.stop();
}, 20000);
```

##### Advantage usage:

```js
// its also possible to pass your own properties
let item2 = Item.create({
	prefix: 'Whats',
	suffix: 'up!',
});

document.body.appendChild(item2);

// will rendered:
/**
<body>
    <com-item>
		<p>Whats up!</p>
	</com-item>
</body>
**/

item2.blink(300);
```
##### Settings:
```js
import { component } from 'app-decorators';

/**
 * 1.) You can pass as first argument your own nativ html class.
 * Default is HTMLElement.
 *
 * 2.) As the second argument you can pass your custom prefix
 */
@component({
	extends: 'img'
})
class Coffee {
	created({ art }){
		this.src = 'some/${art}/pic.png';
	}
}

/**
 * You have access for the passed arguments over
 * created({ art } or over this.art
 */
let coffee = Coffee.create({art: 'espresso'});

console.log(coffee instanceof HTMLImageElement) // log true

document.body.appendChild(coffee);

// will rendered
/**
<img is="com-coffee" src="some/espresso/pic.png" />
**/

```
##### Lifecycle of Component (Custom Elements):
```js
import { component } from 'app-decorators';

class Bean {
	origin = 'africa';
}

@component({
	extends: 'img'
})

// and its possible to extends from other class
class Coffee extends Bean {

	/**
	 * You can add your custom properties and methods. But be careful when choosing the name
	 * of property/method because "this" has a direct reference to dom instance
	 */
	foo = 'Hello';
	bar = 'World';

	someDoSomethingMethod(){
		this.classList.add(this.origin); // see in "class Bean" whats origin is
	}

	/**
	 * CustomElements Callbacks
	 */

	// will called if element is created
	created(){

	}

	// will called if element is in document
	attached(){

	}

	// will called if any attribute changed or added to element
	attributeChanged(oldValue, newValue){

	}

	// will called if element is detached/removed from document
	detached(){

	}
}
```

For more information about CustomElements and their livecylce see: [Link](http://www.html5rocks.com/en/tutorials/webcomponents/customelements/?redirect_from_locale=de)

### @view
```js
import { component, view } from 'app-decorators';

@view(`
	<h3>{{head}}</h3>
	<div>{{count}}</div>
	<div>
		<span class="up"> + </span>
		<span class="down"> - </span>
	</div>
`)

@component()
class Item {

	// whenever you write in "value" the @view component will
	// automatically render the view
	@view.bind count;

	created(){

		this.addEventListener('click', '.up', () => {
			++this.count
		});
		this.addEventListener('click', '.down', () => {
			--this.count
		});

	}

}

let item = Item.create({
	head: 'Some Head',
	count: 1,
});

document.body.appendChild(item);
```

### @on
```js
import { component, view, on } from 'app-decorators';

@view(`
    <div class="add">add</div>
    <div class="edit">edit</div>
    <div class="delete">delete</div>
`)

@component()
class Item {

    @on('click .add') addItem( event ){
        console.log('on click .add');
    }
    @on('click .edit') editItem( event ){
        console.log('on click .edit');
    }
    @on('click .delete') deleteItem( event ){
        console.log('on click .add');
    }

}

let item = Item.create();
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

@component()
class Item {

    @model.attr @view.bind name;
    @model.attr @view.bind city;
    @model.attr @view.bind country = 'Turkey';

    created(){
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

    // alternate style
    @model.upate('name') onUpdateName( value ){
        console.log('@model.update onUpdateName');
    }
    @model.read('name') onReadName( value ){
        console.log('@model.read onReadName');
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
    created(){
        this.setAttribute('type', 'submit');
        this.innerHTML = 'Click me!';
    }
    @on.submit() onSubmit(){
        let item = this.modelpool.get('item');
        item.model.set('name', 'serkan');
    }
}

/**
// on submit
<button is="com-specialbutton" type="submit">Click me!</button>

// it changed to "serkan [ update ]"

<com-item>
    <div class="name">Serkan [ update ]</div>
    <div class="city">Istanbul</div>
    <div class="country">Turkey</div>
</com-item>
 */

```

## Tests
```
make install
make test
```

(c) 2015 - 2016 Serkan Sipahi
App-Decorators may be freely distributed under the [MIT license](https://github.com/SerkanSipahi/app-decorators/blob/master/LICENSE).
