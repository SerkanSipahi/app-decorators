
// internal libs
import { Elements } from '../configs/elements';
import { CustomElement } from '../libs/customelement';

/**
 * Component (CustomElement)
 *
 * @param  {Any} ...args
 * @return {Function}
 */
function component(config = {}) {
	return function decorator(ComponentClass) {
		Object.assign(config, { Elements, Immutable });
		CustomElement.register(ComponentClass, config);
	}
}

export {
	component
};
