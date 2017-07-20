window.bootstrap = function(app) {

    let bootstrap = Promise.all([
        System.import('app-decorators/src/bootstrap'),
        System.import(app),
    ]).then(function() {
        console.log('App: running!');
    }).catch(function() {
        console.warn('App: something gone wrong!', Error().stack);
    });

    return bootstrap;
};