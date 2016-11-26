import { Router } from '../libs/router';
import { initCoreMap, initActionMap } from '../datas/init-maps';
import { storage } from 'app-decorators-helper/random-storage';

/*****************************************
 * ######### Public Decorators ###########
 *****************************************/

/**
 * action
 * @param  {string} route
 * @return {Function}
 */
function action(route) {

    if(!route){
        throw new Error('Please pass an action');
    }

    return (target, method, descriptor) => {

        let Class = target.constructor;

        initCoreMap(storage, Class);
        initActionMap(storage, Class);

        let map = storage.get(Class);

        map.get('@action').get('events').push([
            `${method} ${route}`, descriptor.value
        ]);

        if(map.get('@action').get('callbacksDefined')){
            return;
        }

        map.get('@callbacks').get('created').push(domNode => {

            let events = map.get('@action').get('events');
            domNode.$router = Router.create({
                routes : events,
                scope  : domNode,
                bind   : domNode,
            });
        });

        map.get('@callbacks').get('attached').push(domNode => {

            (domNode.$router && domNode.$router.destroyed)
                ? domNode.$router.init()
                : null;

        });

        map.get('@callbacks').get('detached').push(domNode => {
            domNode.$router.destroy();
        });

        map.get('@action').set('callbacksDefined', true);
    }
}

export {
    action
};