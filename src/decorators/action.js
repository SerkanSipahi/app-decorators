import { Router } from '../apps/router';
import { initCoreMap, initActionMap } from '../datas/init-maps';
import { storage } from '../libs/random-storage';

/**
 * action
 * @param  {string} route
 * @return {Function}
 */
function action(route) {

    if(!route){
        throw new Error('Please pass an action');
    }

    return ({ constructor }, method, { value }) => {

        let Class = constructor;

        initCoreMap(storage, Class);
        initActionMap(storage, Class);

        let map = storage.get(Class);

        map.get('@action').get('events').push([
            `${method} ${route}`, value
        ]);

        /**
         * ### Ensure "registerCallback('created', ..." (see below) registered only once ###
         * This function will called every time if an event registered e.g. @on('click .foo')
         * but registerOnCreatedCallback can only call once because we want only Create
         * one Eventhandler
         */
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

            if(domNode.$router.initialized()){
                return;
            }

            let events = map.get('@action').get('events');
            let config = Router.makeConfig({
                routes : events,
                scope  : domNode,
                bind   : domNode,
            });

            /**
             * Using the same instance is 30% faster in
             * (Chrome, Opera) and no difference in Firefox
             * @see: https://jsperf.com/new-class-vs-singleton
             */
            domNode.$router.reinit(config);

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