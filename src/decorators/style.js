import { Stylesheet } from '../libs/stylesheet';
import { initCoreMap, initStyleMap } from '../datas/init-maps';
import { storage } from '../libs/random-storage';
import { Eventhandler } from '../libs/eventhandler';
import { Router } from '../libs/router';

let getTypeof = value => Object.prototype.toString.call(value).slice(8,-1);

/**
 *
 * @param type {string}
 * @param element {Element}
 * @returns {*}
 */
let getHandler = (type, element) => {

    if(/on|default/.test(type)) {
        return new Eventhandler({ element });
    } else if(type === "action") {
        return Router.create({
            scope: element
        });
    } else if(type === "mediaMatch") {
        // https://wicg.github.io/ResizeObserver/
        return "mediaMatch";
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

            // return if style/s node already created
            // Note: avoid multiple style nodes per component creation!
            if(map.get('@style').get('created')){
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
                    eventFactory: scope => getHandler(style.type, scope),
                }));
            }

            map.get('@style').set('created', true);

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
        });

        map.get('@style').set('callbacksDefined', true);
	}
}

export {
	style
};
