
import CustomElement from '../libs/customelement';

/**
 * Component (CustomElement)
 *
 * @param  {Any} ...args
 * @return {Function}
 */
export default function component(DOMElement) {
	return function decorator(ComponentClass) {
		CustomElement.register(ComponentClass, DOMElement);
	}
}
