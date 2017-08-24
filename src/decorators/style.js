import { Stylesheet } from '../libs/stylesheet';
import { initCoreMap, initStyleMap } from '../datas/init-maps';
import { storage } from '../libs/random-storage';
import { Eventhandler } from '../libs/eventhandler';
import { Router } from '../apps/router';

let getTypeof = value => Object.prototype.toString.call(value).slice(8,-1);

/**
 *
 * @param type {string}
 * @param element {Element}
 * @returns {*}
 */
let getHandler = (style, element) => {

    let {type} = style;

    if(type === "on" || type === "default") {
        return new Eventhandler({ element });
    } else if(type === "action") {

        style.attachOn += ` ${style.attachOn}`;
        let router = Router.create({
            scope: element
        });
        router.start();
        return router;
    } else if(type === "query") {
        // https://wicg.github.io/ResizeObserver/
        return {
            on: () => {},
            off: () => {}
        }
    }
};

/**
 * Style
 * @param  {string|Array} styles
 * @return {Function}
 */
function style(styles, options = {}) {

	return Class => {

        initCoreMap(storage, Class);
        initStyleMap(storage, Class);

        if(getTypeof(styles) === 'String'){
            styles = [{
                styles: styles,
                type: 'on',
                attachOn: 'load',
                imports: [],
            }];
        }


        let map = storage.get(Class);
        map.get('@style').set('stylesheets', styles);

        /**
         * Its required when we use @style multiple times!
         * Only once registration!
         */
        if(map.get('@style').get('callbacksDefined')){
            return;
        }

        map.get('@callbacks').get('created').push(domNode => {

            if(!(domNode.$stylesheets && domNode.$stylesheets.length)){
                domNode.$stylesheets = [];
            }

            // return if style/s node already created (createdCount > 0)
            // Note: avoid multiple style nodes per component creation!

            // Note: What we do when someone create nodes and not use it
            // immediately without appending to document? The counter is e.g. 3!
            // So after a while new nodes created and attached to
            // document. Style.js will not created styles due createdCount is e.g 3
            // due its never detached and createdCount never decremented.
            let createdCount = map.get('@style').get('createdCount');
            if(createdCount > 0){
                map.get('@style').set('createdCount', ++createdCount);
                return;
            }

            let styles = map.get('@style').get('stylesheets');
            for(let i = 0, len = styles.length; i < len; i++){
                let style = styles[i];

                domNode.$stylesheets.push(new Stylesheet({
                    appendTo: domNode,
                    attachOn: style.attachOn,
                    imports: style.imports,
                    styles: style.styles,
                    type: style.type,
                    order: i,
                    fallback: options.fallback,
                    eventFactory: element => getHandler(style, element),
                }));
            }

            map.get('@style').set('createdCount', ++createdCount);

		});

        map.get('@callbacks').get('attached').push(domNode => {

            for(let stylesheet of domNode.$stylesheets){
                if(stylesheet.initialized()){
                    return null;
                }
                stylesheet.reinit(domNode);
            }
        });

        map.get('@callbacks').get('detached').push(domNode => {

            for(let stylesheet of domNode.$stylesheets){
                stylesheet.destroy();
            }

            let createdCount = map.get('@style').get('createdCount');
            map.get('@style').set('createdCount', --createdCount);
        });

        map.get('@style').set('callbacksDefined', true);
	}
}

export {
	style
};
