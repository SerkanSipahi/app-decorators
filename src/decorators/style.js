import { Stylesheet } from '../libs/stylesheet';
import { initCoreMap, initStyleMap } from '../datas/init-maps';
import { storage } from '../libs/random-storage';
import { Eventhandler } from '../libs/eventhandler';
import { Router } from '../apps/router';

/**
 *
 * @param style {Object}
 * @param element {Element}
 * @returns {*}
 */
let getHandler = (style, element) => {

    let {type} = style;

    // default state is immediately
    if(type === "on" || type === "default") {
        return new Eventhandler({ element });
    } else if(type === "action") {

        //style.attachOn += ` ${style.attachOn}`;
        let router = Router.create({
            scope: element
        });
        router.start();
        return router;
    } else if(type === "query") {
        // https://wicg.github.io/ResizeObserver/
        return {
            on:  () => {},
            off: () => {},
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
 * @returns domNode {Element}
 */
let createStylesheet = (Class, styles, domNode, options, stylesheetStates) => {

    for(let i = 0, len = styles.length; i < len; i++){
        let style = styles[i];
        let stylesheet = new Stylesheet({
            appendTo: domNode,
            attachOn: style.attachOn,
            imports: style.imports,
            styles: style.styles,
            type: style.type,
            order: i,
            alreadyDone: stylesheetStates[i],
            fallback: options.fallback,
            eventFactory: element => getHandler(style, element),
        });

        domNode.$stylesheets.push(stylesheet);
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

        // Stylesheets holds the styles (ast) that
        // are passed by the @style decorator
        styleMap.set('stylesheets', styles);

        // referenceNodes holds the current created domNodes (customElements)
        let nodes = styleMap.get('referenceNodes');

        // stylesheetStates holds the event state (event reached or not)
        // of each style-ast in styles object
        let stylesheetStates = styleMap.get('stylesheetStates');

        /**
         * Its required when we use @style multiple times!
         * Only once registration!
         */
        if(map.get('@style').get('callbacksDefined')){
            return;
        }

        let createdAndAttached = domNode => {
            setPath(domNode, '$stylesheets', []);
            // create stylesheet node when no referenceNodes (customelement) exists
            if(!nodes.size) {
                // default state of each style-ast is false (undefined)
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

            // not each domNode has $stylesheets, so return when no once found.
            if(!domNode.$stylesheets.length) {
                return null;
            }

            // stylesheetStates (attachOn) are the event state (reached or not reached) of each
            // array object (styles, imports, ...) that are passed by style decorator.
            // The state of an array object is required ...
            // [
            //   {
            //      attachOn: 'load',
            //      type: 'on',
            //      imports: ["a.css", "b.css", "c.css"],
            //      styles: '.baz {color: green;}',
            //   },
            //   {
            //      attachOn: 'immediately',
            //      type: 'lala',
            //      imports: [],
            //      styles: '.laz {color: green;}',
            //   }
            // ]
            stylesheetStates = syncStylesheetStates(domNode.$stylesheets, stylesheetStates) || [];

            // when elements detached from document.body, we need a new node that take the role of $stylesheet
            let node = (nodes.values()).next().value;

            // when node is valid, create fresh stylesheet
            if(node) {
                createStylesheet(Class, styles, node, options, stylesheetStates);
            }

            // save the stylesheetStates
            styleMap.set('stylesheetStates', stylesheetStates);
            //cleanup
            delete domNode.$stylesheets;

        });

        map.get('@style').set('callbacksDefined', true);
	}
}

export {
	style
};
