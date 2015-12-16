// Die Reihenfolge von view und view.bind mit promise auflösen

// internal libs
import Viewengine from '../libs/view';

// external libs
import { Object } from 'core-js/library';
import Handlebars from 'handlebars';

/**
 * Register view template
 * @param  {Any} ...args
 * @return {Function}
 */
function view(template, name) {

	if(!template) {
		throw new Exception('Please pass a template!');
	}

	return function(target, name, descriptor) {
		Viewengine.registerTemplate(target, template);
	}

};

/**
 * Register view vars
 * @param  {Object} target
 * @param  {String} property
 * @param  {Object} descriptor
 * @return {undefined}
 */
view.bind = function(target, property, descriptor){

	let value = descriptor.initializer ? descriptor.initializer() : '';
	Viewengine.bind(target, property, value);

};
export default view;
