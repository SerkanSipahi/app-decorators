### @view

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

@component()
class Item {

	@view.bind count;

	on('click .up') onClickUp() {
	    ++this.count
	}

	on('click .down') onClickUp() {
	    --this.count
	}

}

// create directly with javascript
let item = Item.create({
	head: 'Some Head',
	count: 1,
});

// or with tag in html


document.body.appendChild(item);
```
