
/**
 * Inherit
 *
 * @param  {Function} Child
 * @param  {Element} Parent
 * @return {undefined}
 */
function inherit(Child: Funtion, Parent: Element) {
	let F = function() {};
	F.prototype = Parent.prototype;
	Child.prototype = new F();
	Child.prototype.constructor = Child;
}

/**
 * Component (CustomElement)
 *
 * @param  {Any} ...args
 * @return {Function}
 */
export default function component(Element) {

	if (Element === void 0) {
		throw Error(`Passed argument is undefined`);
	}

	return function decorator(Component) {
		inherit(Component, Element);
	}

}
