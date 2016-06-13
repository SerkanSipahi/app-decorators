
let namespace = {

	/**
	 * create a namespace on passed target
	 * @param  {object} target
	 * @param  {string} namespace_string
	 * @return {target}
	 */
	create: (target = {}, namespace_string = '', add = null) => {

		let parts = namespace_string.split('.');
		let parent = target;

		for(let i = 0, length = parts.length; i < length; i++) {

			if(typeof parent[parts[i]] === 'undefined') {
				parent[parts[i]] = {};
			}
			if(add && (i+1) === length) {
				parent[parts[i]] = add;
			}
			parent = parent[parts[i]];

		}

		return target;

	},

};

export {
	namespace,
	namespace as default
};
