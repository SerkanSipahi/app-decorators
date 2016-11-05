### @view

##### counter.js
```js
import { component, view, on } from 'app-decorators';

@view(`
	<h3>{{header}}</h3>
	<div>{{count}}</div>
	<div>
		<span class="up"> + </span>
		<span class="down"> - </span>
	</div>
`)

@component()
class Counter {

	@view.bind count;

	on('click .up') onClickUp() {
	    ++this.count
	}

	on('click .down') onClickUp() {
	    --this.count
	}
}
```

##### create in html:

```html
<com-counter header="Counter" count="1"></com-counter>
```

##### create directly with javascript
```html

let counter = Counter.create({
	header: 'My Counter',
	count: 0,
});

document.body.appendChild(counter);
```

##### will render:
```html
<com-counter header="Counter" count="1">
	<h3>My Counter</h3>
	<div>0</div>
	<div>
		<span class="up"> + </span>
		<span class="down"> - </span>
	</div>
</com-counter>
```

##### using slot:
```js
import { component, view, on } from 'app-decorators';

@view(`
	<h3><slot><slot></h3>
	<div>{{count}}</div>
	<div>
		<span class="up"> + </span>
		<span class="down"> - </span>
	</div>
`)

@component()
class Counter {

	@view.bind count;

	on('click .up') onClickUp() {
	    ++this.count
	}

	on('click .down') onClickUp() {
	    --this.count
	}
}
```
```html
<com-counter count="0">
    My Counter
</com-counter>
```

##### will render:
```html
<com-counter count="0">
	<h3>
	    <slot>My Counter</slot>
	</h3>
	<div>0</div>
	<div>
		<span class="up"> + </span>
		<span class="down"> - </span>
	</div>
</com-counter>
```

##### it also possible nested components for complex structures:

```js

// myparent.js
@component({
    name: 'my-parent',
})
@view(`
    <div class="a"></div>
    <div class="b"></div>
    <div class="c">
        <span><slot></slot></span>
    </div>
`)
class MyParent {
}

//mychild.js
@component({
    name: 'my-child',
})
@view(`
    <ul>
        <li> One </li>
        <li> Two </li>
        <li>
            <slot></slot>
        </li>
    </ul>
`)
class MySpecialCom {
}

// mysister.js
@component({
    name: 'my-sister',
})
@view('<p>sister</p>')
class MySister {
}

```

#### then slot the components together
```html
<my-parent>
    <my-child>
        <my-sister>
            <p>Hello World</span>
        </my-sister>
    </my-child>
</my-parent>
```
##### will render:
```html
<my-parent rendered="true">
    <div class="a"></div>
    <div class="b"></div>
    <div class="c">
        <span>
            <slot>
                <my-child rendered="true">
                    <ul>
                        <li> One </li>
                        <li> Two </li>
                        <li>
                            <slot>
                                <my-sister rendered="true">
                                    <p>Hello World</p>
                                    <p>sister</p>
                                </my-sister>
                            </slot>
                        </li>
                    </ul>
                </my-child>
            </slot>
        </span>
    </div>
</my-parent>
```