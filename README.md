#### app-decorators

##### First thoughts:
```js

import { component, view, style } from './app-decorators';

@style(`
    .some-class {
        color: red;
    }
    #some-id {
        color: blue;
    }
`);

@view(`
    <section>
        <div class="{{classname}}"> {{content}} </div>
    </section>
`);

@component({
    name: 'navigation',
    type: 'Element',
});

export default class Navigation {

    // DomEvents
    @on('click .some-selector-1') showFoo( e ) {

    }
    @on('mouseenter .some-selector-2') showBar( e ) {

    }
    @on('submit .some-selector-3') showBaz( e ) {

    }

    // Custom Element-Events
    created(){

    }

    attached(){

    }

    detached(){

    }

    attributeChanged(){

    }
}

```
