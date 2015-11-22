
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
export default function component(El = HTMLDivElement) {
	return function decorator(ComponentClass) {
		inherit(ComponentClass, El);
	}
}
