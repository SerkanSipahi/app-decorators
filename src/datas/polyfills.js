/**
 * modules
 * @resources:
 * - hayato.io/2016/shadowdomv1/
 * @type {*[]}
 */
let polyfills = [
    [Object, 'assign', 'node_modules/core-js/library/fn/object/assign'],
    [Object, 'values', 'node_modules/core-js/library/fn/object/values'],
    [Object, 'entries', 'node_modules/core-js/library/fn/object/entries'],
    [document, 'registerElement', 'node_modules/webcomponents.js/webcomponents-lite', true],
    [window, 'Reflect', 'node_modules/core-js/library/fn/reflect'],
    [window, 'WeakMap', 'node_modules/core-js/library/fn/weak-map'],
    [window, 'Map', 'node_modules/core-js/library/fn/map'],
    [Element.prototype, 'after', 'node_modules/dom4/build/dom4', true],
];

export {
    polyfills,
}