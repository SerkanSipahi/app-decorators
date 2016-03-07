
// internal libs
import Elements from '../datas/elements';
import CustomElement from '../libs/customelement';

// external libs
import { Immutable } from '../libs/dependencies';


/**
 * Component (CustomElement)
 *
 * @param  {Any} ...args
 * @return {Function}
 */
export default function component(config = {}) {
	return function decorator(ComponentClass) {
		Object.assign(config, { Elements, Immutable })
		CustomElement.register(ComponentClass, config);
	}
}
