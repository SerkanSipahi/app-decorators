
/**
 * Excract domnode attributes
 * @param  {HTMLElement} domNode
 * @param  {Strng} type
 * @param  {Boolean} removeDomAttributes
 * @return {Object}
 */
export default function extractDecoratorProperties(domNode, type, removeDomAttributes = false) {

	const expressions = {
		['@on']: /^@on\((\S+)\)$/i,
		['@view.bind']: /^@view\.bind\.(\S+)$/i,
	};

	let filterRegex = expressions[type];
	if(filterRegex && Object.classof(filterRegex) !== 'RegExp'){
		throw Error('Second argument is passed but it must be a Regular-Expression');
	}

	let domViewAttributes = {};
	let toBeRemovedAttributes = [];
	for(let key in domNode.attributes) {
		if(!domNode.attributes.hasOwnProperty(key)){
			continue;
		}

		let node = domNode.attributes[key];
		if(filterRegex){
			let matched = filterRegex.exec(node.name);
			if(matched !== null) {
				let [ ,name ] = matched;
				domViewAttributes[name] = node.value;
				removeDomAttributes ? toBeRemovedAttributes.push(node.name) : null;
			}
		} else {
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
