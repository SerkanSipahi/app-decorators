import $ from 'jquery';
import { bootstrapPolyfills } from 'src/bootstrap';
import { delay } from 'src/helpers/delay';

describe('imported component', async() => {

	await bootstrapPolyfills;
	let { component } = await System.import('app-decorators');
	let { Test } = await System.import('test/imports/testcomponent');

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

	it('should create an domnode', async () => {

		let col = Col.create({
			testEl: Test.create()
		});

        await delay(5);
		col.outerHTML.should.equal(`<com-col><com-test rendered="true"><div class="A">1</div></com-test></com-col>`);
	});

});
