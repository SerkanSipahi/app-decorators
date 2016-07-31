### @model [ in progress / idea ]

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
