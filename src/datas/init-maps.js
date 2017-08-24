/**
 * We setup a map for each component when is required. E.g when a component
 * just use @action and @view it will setup map for only these components
 */

/**
 * initCoreMap
 * @param storage {WeakMap}
 * @param Class {function}
 */
let initCoreMap = (storage, Class) => {

    if(!storage.has(Class)){
        storage.set(Class, new Map([
            ['@callbacks', new Map([
                ['created',  []],
                ['attached', []],
                ['detached', []],
            ])],
        ]));
    }
};

/**
 * initActionMap
 * @param storage {WeakMap}
 * @param Class {function}
 */
let initActionMap = (storage, Class) => {

    let map = storage.get(Class);
    if(!map.has('@action')){
        map.set('@action', new Map([
            ["events", []],
            ["callbacksDefined", false],
        ]));
    }
};

/**
 * initOnMap
 * @param storage {WeakMap}
 * @param Class {function}
 */
let initOnMap = (storage, Class) => {

    let map = storage.get(Class);
    if(!map.has('@on')){
        map.set('@on', new Map([
            ["events", new Map([
                ["local", []],
                ["context", []],
            ])],
            ["callbacksDefined", false],
        ]))
    }
};

/**
 * initViewMap
 * @param storage {WeakMap}
 * @param Class {function}
 */
let initViewMap = (storage, Class) => {

    let map = storage.get(Class);
    if(!map.has('@view')){
        map.set('@view', new Map([
            ["bind", []],
            ["callbacksDefined", false],
        ]));
    }
};

/**
 * initStyleMap
 * @param storage {WeakMap}
 * @param Class {function}
 */
let initStyleMap = (storage, Class) => {

    let map = storage.get(Class);
    if(!map.has('@style')){
        map.set('@style', new Map([
            ["stylesheets", null],
            ["callbacksDefined", false],
            ["createdCount", 0],
        ]));
    }
};

export {
    initCoreMap,
    initActionMap,
    initOnMap,
    initViewMap,
    initStyleMap,
}