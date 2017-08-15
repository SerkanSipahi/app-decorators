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
    } else if(type === "mediaMatch") {
        // https://wicg.github.io/ResizeObserver/
        return {
            on: () => {},
            off: () => {}
        }
    }
};

/**
 * @param style {object}
 * @returns {object}
 */
let createEventHandlerValue = style => {

    let eventName = style.attachOn.replace(/ /g, '-');
    let eventValue = style.attachOn;
    style.attachOn = `${eventName} ${eventValue}`;

    return style;
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


                // when no action name passed, then take the eventname
                if(style.type === "action" && style.attachOn.split(' ').length === 1){
                    style = createEventHandlerValue(style);
                } else if(style.type === "mediaMatch"){
                    style = createEventHandlerValue(style);
                }
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
