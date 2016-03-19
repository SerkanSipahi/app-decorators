
import { Immutable } from '../../src/libs/dependencies';
import extractDecoratorProperties from '../../src/helpers/extract-decorator-properties';

describe('extractDecoratorProperties', () => {

	function Element(){
		this.attributes = {
			0: { name: '@view.bind.b', value: 'baz' },
			1: { name: 'class', value: 'foo' },
			2: { name: '@view.bind.x', value: 'bar' },
		};
	}

	Element.prototype = {
		// simulate removing of removeAttribute
		removeAttribute : function(attribute) {
			for(let attr in this.attributes){
				if(!this.attributes.hasOwnProperty(attr)) continue;
				if(this.attributes[attr].name === attribute){
					delete this.attributes[attr];
				}
			}
		}
	};

	it('it should return objectlist of dom attributes that matched of @view.bind', () => {

		let MockDomNode = new Element();
		let viewAttributeList = extractDecoratorProperties(MockDomNode, '@view.bind', true);

		// positiv test
		viewAttributeList.should.have.propertyByPath('x').eql('bar');
		viewAttributeList.should.have.propertyByPath('b').eql('baz');
		// negativ test
		viewAttributeList.should.not.have.propertyByPath('class');

		// the third argument for getDomAttributes removes the dom attribute
		Object.keys(MockDomNode.attributes).should.have.length(1);
		MockDomNode.attributes.should.have.propertyByPath(1, 'name').eql('class');

		let regularAttributeList = extractDecoratorProperties(MockDomNode);
		regularAttributeList.should.have.propertyByPath('class').eql('foo');

	});

});
