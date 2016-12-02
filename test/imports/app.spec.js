import $ from 'jquery';
import { bootstrapPolyfills } from 'src/bootstrap';

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
