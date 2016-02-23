
// internal libs
import { component } from 'src/app-decorators';
import Test from './testcomponent';

// external libs
import $ from 'jquery';

describe('imported component', () => {

	@component()
	class Col {

		item = { name: 'A', content: 1 };

		created(){
			let testCom = Test.create(this.item);
			$(this).append(testCom);
		}

	}

	it('should create an domnode', () => {

		let col = Col.create();
		col.outerHTML.should.equal('<com-col><com-test><div class="A">1</div></com-test></com-col>');

	});

});
