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

        console.log(
            event,        // Event
            event.target, // <a href="...
            params,       // { params: { state: 'show' } }
            params.state, // show
            search,       // { sidebar: 'show' }
            hash          // {}
        );
    }
}
```
```html
<body>
    <com-sidebar></com-sidebar>
</body>
```
