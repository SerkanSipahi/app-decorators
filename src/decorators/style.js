import { Stylesheet } from '../libs/stylesheet';
import { initCoreMap, initStyleMap } from '../datas/init-maps';
import { storage } from 'app-decorators-helper/random-storage';

/**
 * Style
 * @param  {string|Array} styles
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
            styles = [{
                styles: styles
            }];
        }


        let map = storage.get(Class);
        map.get('@style').set('stylesheets', styles);

        map.get('@callbacks').get('created').push(domNode => {

            if(!(domNode.$stylesheets && domNode.$stylesheets.length)){
                domNode.$stylesheets = [];
            }

            let styles = map.get('@style').get('stylesheets');
            for(let style of styles){
                domNode.$stylesheets.push(new Stylesheet({
                    appendTo: domNode,
                    attachOn: style.attachOn,
                    styles: style.styles,
                }));
            }
		});

        map.get('@callbacks').get('attached').push(domNode => {

            for(let stylesheet of domNode.$stylesheets){
                if(stylesheet.initialized()){
                    return null;
                }
                stylesheet.reinit(domNode);
            }
        });

        map.get('@callbacks').get('detached').push(domNode => {

            for(let stylesheet of domNode.$stylesheets){
                stylesheet.destroy();
            }
        });
	}
}

style.helper = {
      createStyleSheet(){

      }
};

export {
	style
};
