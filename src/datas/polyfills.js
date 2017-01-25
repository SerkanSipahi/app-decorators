/**
 * modules
 * @type {*[]}
 */
let polyfills = [
    [Object, 'assign', 'node_modules/core-js/library/fn/object/assign'],
    [Object, 'values', 'node_modules/core-js/library/fn/object/values'],
    [Object, 'entries', 'node_modules/core-js/library/fn/object/entries'],
    [HTMLElement.prototype, 'attachShadow', 'node_modules/@webcomponents/shadydom/shadydom.min.js', true],
    [document, 'registerElement', 'node_modules/webcomponents.js/webcomponents-lite', true],
    [window, 'Reflect', 'node_modules/core-js/library/fn/reflect'],
    [window, 'WeakMap', 'node_modules/core-js/library/fn/weak-map'],
    [window, 'Map', 'node_modules/core-js/library/fn/map'],
];

export {
    polyfills,
}