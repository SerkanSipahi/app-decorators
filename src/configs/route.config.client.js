import { RegExp } from '../libs/dependencies';
import { queryString } from '../helpers/queryString';
import { guid } from '../helpers/guid';

let routerConfig = {

    routes: [],

    scope: document.body,
    globalScope: window,
    bind  : null,

    history: {
        forward     : ::history.forward,
        back        : ::history.back,
        pushState   : ::history.pushState,
        replaceState: ::history.replaceState,
    },

    event: {
        action   : 'click a',
        popstate : 'popstate',
        urlchange: 'urlchange',
    },
    mode: {
        shadowRoute: false,
    },
    helper: {
        RegExp     : RegExp,
        queryString: queryString,
        guid       : guid,
    },
};

export {
    routerConfig,
}