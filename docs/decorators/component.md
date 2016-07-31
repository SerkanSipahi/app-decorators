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
