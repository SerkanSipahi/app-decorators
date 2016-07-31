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

    // bind global events
    @on('resize', window) onResize(event){

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
