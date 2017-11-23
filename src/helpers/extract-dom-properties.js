let classof = value => {
	return Object.prototype.toString.call(value).slice(8, -1);
};

/**
 * Extract domnode attributes
 * @param  {HTMLElement} domNode
 * @param  {Regex} expression
 * @param  {Boolean} removeDomAttributes
 * @return {Object}
 */
function extractDomProperties(domNode, regex, removeDomAttributes = false) {


	if(regex && classof(regex) !== 'RegExp'){
		throw Error('Second argument is passed but it must be a Regular-Expression');
	}

	let domViewAttributes = {};
	let toBeRemovedAttributes = [];

	for(let key in domNode.attributes) {
		if(!domNode.attributes.hasOwnProperty(key)){
			continue;
		}

		let node = domNode.attributes[key];
		if(regex){
			let matched = regex.exec(node.name);
			if(matched !== null) {
				let [ ,name ] = matched;
				domViewAttributes[name] = node.value;
				removeDomAttributes ? toBeRemovedAttributes.push(node.name) : null;
			}
		}
		else if(!regex) {
			domViewAttributes[node.name] = node.value;
		}

	}

	if(removeDomAttributes){
		for(let attribute of toBeRemovedAttributes){
			domNode.removeAttribute(attribute);
		}
	}

	return domViewAttributes;

}

export {
	extractDomProperties
};
