
// internal libs
import { Router } from '../libs/router';

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

        // register namespaces
        action.helper.registerNamespaces(target);
        // register events
        action.helper.registerEvent(target, route, descriptor.value);

        /**
         * ### Ensure "registerCallback('created', ..." (see below) registered only once ###
         * This function will called every time if an event registered e.g. @on('click .foo')
         * but registerOnCreatedCallback can only call once because we want only Create
         * one eventhandler
         */
        if(target.$.config.action.created.length > 0){
            return;
        }

        action.helper.registerCallback('created', target, ( domNode ) => {

        });

        action.helper.registerCallback('attached', target, (domNode) => {

        });

        action.helper.registerCallback('detached', target, (domNode) => {

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
                component: {
                    created: [],
                    attached: [],
                    detached: [],
                },
            };
        }

        return target;

    },

    registerEvent: (target, eventDomain, callback = function(){}) => {

    },

    registerCallback: (name, target, callback) => {

    },

};


export {
    action
};