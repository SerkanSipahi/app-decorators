import { component } from 'src/app-decorators';
import Test from './testcomponent';

import $ from 'jquery';

describe('imported component', () => {

	@component()
	class Col {

		created({ testEl }){

			this.item = {
				name: 'A',
				content: 1
			};

			testEl.render(this.item);
			$(this).append(testEl);
		}

	}

	it('should create an domnode', done => {

		let col = Col.create({
			testEl: Test.create()
		});

		setTimeout(() => {
			col.outerHTML.should.equal(`<com-col><com-test rendered="true"><div class="A">1</div></com-test></com-col>`);
			done();
		}, 20);
	});

});
