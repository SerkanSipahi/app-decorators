/**
 * promises
 * @type {null|Promise}
 */
let promises = null;

/**
 * lazyPolyfillLoader
 * @returns {Promise.<*>}
 */
let lazyPolyfillLoader = function(Loader, modules, basePath = '') {

    if(promises){
        return promises;
    }

    let _modules = modules.filter(([global, property]) =>
        !global[property]
    );

    if(!_modules.length){
        return Promise.resolve([]);
    }

    let _basePath = basePath ? `${basePath}/`: basePath;

    promises = Promise.all(_modules.map(([global, property, path, assign]) =>
        Loader.import(`${_basePath}${path}`).then(module =>
            !assign ? global[property] = module : null
        )
    ));

    promises.catch((error) => {
       throw new Error(error);
    });

    return promises;


};

export {
    lazyPolyfillLoader
}