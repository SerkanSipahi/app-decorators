import { Stylesheet } from '../libs/stylesheet';
import { initCoreMap, initStyleMap } from '../datas/init-maps';
import { storage } from 'app-decorators-helper/random-storage';

/**
 * Style
 * @param  {string} styles
 * @return {Function}
 */
function style(styles) {

    let getTypeof = value => {
        return Object.prototype.toString.call(value).slice(8,-1);
    };

	return Class => {

        initCoreMap(storage, Class);
        initStyleMap(storage, Class);

        if(getTypeof(styles) === 'String'){
            //Object.assign(Stylesheet.defaultOptions, { styles });
        }


        let map = storage.get(Class);
        map.get('@style').set('stylesheets', styles);

        map.get('@callbacks').get('created').push(domNode => {

            let styles =  map.get('@style').get('stylesheets');
            let stylesheet = new Stylesheet({
                appendTo: domNode,
                styles: styles,
            });

            domNode.$stylesheet = stylesheet;

		});

        map.get('@callbacks').get('attached').push(domNode => {

            if(domNode.$stylesheet.initialized()){
                return null;
            }

            domNode.$stylesheet.reinit(domNode);

        });

        map.get('@callbacks').get('detached').push((domNode) => {
            domNode.$stylesheet.destroy();
        });
	}
}

export {
	style
};
