### @action

```js
import { component, action, view } from 'app-decorators';


@view(`
    <a href="?sidebar=show" > ||| </a>
`)

@component()
class Sidebar {
    
    /**
     * Sidebar
	 * @param {Event} event
	 * @param {object} params
     */
    @action('Sidebar ?sidebar={{state}}') sidebar({ event, params, search, hash }){

        this._toggleState(event, params.state);
    }
    
    /**
     * _toggleState
	 * @param {string} state
     */
    _toggleState(state){
       
       event.target.href = ( state === 'show' ? show 'hide' );
    }
    
}

```
```html
<body>
    <com-sidebar></com-sidebar>
</body>
```
