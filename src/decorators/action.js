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
            storage.set(Class, new Map());
        }

        let map = storage.get(Class);
        map.set('@action', {
            events: {},
        });

        action.helper.registerNamespaces(target);

        let actionQuery = `${method} ${route}`;
        action.helper.registerEvent(target, actionQuery, descriptor.value);

        /**
         * ### Ensure "registerCallback('created', ..." (see below) registered only once ###
         * This function will called every time if an event registered e.g. @on('click .foo')
         * but registerOnCreatedCallback can only call once because we want only Create
         * one eventhandler
         */
        if(target.$.config.action.component.created.length > 0){
            return;
        }

        action.helper.registerCallback('created', target, (domNode) => {

            let events = target.$.config.action.events;
            let router = Router.create({
                routes : events,
                scope  : domNode,
                bind   : domNode,
            });
            domNode.$router = router;

        });

        action.helper.registerCallback('attached', target, (domNode) => {

            if(domNode.$router && domNode.$router.destroyed){
                domNode.$router.init();
            }

        });

        action.helper.registerCallback('detached', target, domNode => {
            domNode.$router.destroy();
        });

    }
}

/*****************************************
 * ########## Decorator Helper ###########
 *****************************************/

action.helper = {

    /**
     * Register namespace of on decorator
     * @param  {object} target
     * @return {object} target
     */
    registerNamespaces: (target) => {

        // register "root" namespace
        if(!target.$) target.$ = {};

        // register "config" namespace
        if(!target.$.config) target.$.config = {};

        // register "on" namespace
        if(!target.$.config.action) {
            target.$.config.action = {
                events: {},
                component: {
                    created: [],
                    attached: [],
                    detached: [],
                },
            };
        }

        return target;
    },

    /**
     * Helper for registering events
     * @param  {string} event
     * @param  {string} eventDomain
     * @param  {Function} callback
     * @return {object} target
     */
    registerEvent: (target, eventDomain, callback = function(){}) => {

        target.$.config.action.events[eventDomain] = callback;

        return target;
    },

    /**
     * Helper for registering callbacks
     * @param  {string} name
     * @param  {object} target
     * @return {function} callack
     */
    registerCallback: (name, target, callback) => {

        target.$.config.action.component[name].push(callback);

        return target;
    },

};


export {
    action
};