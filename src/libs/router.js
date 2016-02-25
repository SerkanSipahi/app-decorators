
export default class Router {

	/**
	 * Create an instance of Router Class
	 * @param  {Object} config
	 * @return {Object}
	 */
	static create(config){

		if(Object.classof(config) !== 'Object') {
			throw new Error('Passed Object must be an object {}');
		}

	}

}
