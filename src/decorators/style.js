import { Stylesheet } from '../libs/stylesheet';
import { initCoreMap, initStyleMap } from '../datas/init-maps';
import { storage } from '../libs/random-storage';
import { Eventhandler } from '../libs/eventhandler';
import { Router } from '../apps/router';

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
 * @param stylesheets {Array}
 * @param stylesheetStates {Array}
 */
let syncStylesheetStates = (stylesheets, stylesheetStates) => {
    stylesheetStates = [];
    stylesheets.forEach(stylesheet => stylesheetStates.push(stylesheet.alreadyDone));
    return stylesheetStates;
};

/**
 * @param object {Object}
 * @param key {string}
 * @param value {*}
 */
let setPath = (object, key, value) => {
    if(!(object[key] && object[key].length)){
        object[key] = value;
    }
};

/**
 * @param Class {function}
 * @param styles {Array}
 * @param domNode {{$stylesheets: Array}}
 * @param options {{fallback: Function}}
 * @param stylesheetStates {Array}
 * @returns {Element}
 */
let createStylesheet = (Class, styles, domNode, options, stylesheetStates) => {

    setPath(domNode, '$stylesheets', []);

    for(let i = 0, len = styles.length; i < len; i++){
        let style = styles[i];
        domNode.$stylesheets.push(new Stylesheet({
            appendTo: domNode,
            attachOn: style.attachOn,
            imports: style.imports,
            styles: style.styles,
            type: style.type,
            order: i,
            alreadyDone: stylesheetStates[i],
            fallback: options.fallback,
            eventFactory: element => getHandler(style, element),
        }));
    }

    return domNode;
};

/**
 * Style
 * @param  {string|Array} styles
 * @param options {{fallback: Function}}
 * @return {Function}
 */
function style(styles, options = {}) {

	return Class => {

        initCoreMap(storage, Class);
        initStyleMap(storage, Class);

        let map = storage.get(Class);
        let styleMap = map.get('@style');

        styleMap.set('stylesheets', styles);
        let nodes = styleMap.get('referenceNodes');
        let stylesheetStates = styleMap.get('stylesheetStates');

        /**
         * Its required when we use @style multiple times!
         * Only once registration!
         */
        if(map.get('@style').get('callbacksDefined')){
            return;
        }

        let createdAndAttached = domNode => {
            if(!nodes.size) {
                let stylesheetStates = styleMap.get('stylesheetStates');
                createStylesheet(Class, styles, domNode, options, stylesheetStates);
            }
            !nodes.has(domNode) && nodes.set(domNode, domNode);
        };

        map.get('@callbacks').get('created' ).push(createdAndAttached);
        map.get('@callbacks').get('attached').push(createdAndAttached);
        map.get('@callbacks').get('detached').push(domNode => {

            // cleanup
            domNode.$stylesheets.forEach(stylesheet => stylesheet.destroy());

            // remove detached node from referenceNodes
            nodes.has(domNode) && nodes.delete(domNode);

            if(!domNode.$stylesheets.length) {
                return null;
            }

            stylesheetStates = syncStylesheetStates(domNode.$stylesheets, stylesheetStates) || [];
            let node = (nodes.values()).next().value;

            // create fresh stylesheet
            if(node) {
                createStylesheet(Class, styles, node, options, stylesheetStates);
            }

            styleMap.set('stylesheetStates', stylesheetStates);
            delete domNode.$stylesheets;

        });

        map.get('@style').set('callbacksDefined', true);
	}
}

export {
	style
};
