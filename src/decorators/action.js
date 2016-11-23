import { Router } from '../libs/router';
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
        if(!storage.has(Class)){
            storage.set(Class, new Map([
                ['@callbacks', new Map([
                    ['created',  []],
                    ['attached', []],
                    ['detached', []],
                ])]
            ]));
        }

        let map = storage.get(Class);
        if(!map.has('@action')){
            map.set('@action', new Map([
                ["events", new Map()],
                ["callbacksDefined", false],
            ]));
        }

        map.get('@action').get('events').set(`${method} ${route}`, descriptor.value);

        /**
         * ### Ensure "registerCallback('created', ..." (see below) registered only once ###
         * This function will called every time if an event registered e.g. @on('click .foo')
         * but registerOnCreatedCallback can only call once because we want only Create
         * one eventhandler
         */
        if(map.get('@action').get('callbacksDefined')){
            return;
        }

        map.get('@callbacks').get('created').push(domNode => {

            let events = {};
            let entries = map.get('@action').get('events').entries();
            Array.from(entries).forEach(item => events[item[0]] = item[1]);

            let router = Router.create({
                routes : events,
                scope  : domNode,
                bind   : domNode,
            });

            domNode.$router = router;
        });

        map.get('@callbacks').get('attached').push(domNode => {

            if(domNode.$router && domNode.$router.destroyed){
                domNode.$router.init();
            }

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