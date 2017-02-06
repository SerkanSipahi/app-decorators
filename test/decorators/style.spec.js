import $ from 'jquery';
import { bootstrapPolyfills } from 'src/bootstrap';
import { EVENT_VIEW_RENDER } from 'src/libs/view';
import { delay } from 'src/helpers/delay';
import { storage } from "src/libs/random-storage";

import sinon from 'sinon';

// init special innerHTML for test
String.prototype.removeGutter = function(){
    return this.replace(/[\t\n\r]/gm, '');
};

describe('@style decorator', async () => {

    await bootstrapPolyfills;
    let { component, view, style } = await System.import('app-decorators');

    it('should call customElements hooks in right order', async () => {

        @style(`
            style-order .foo { 
                color: gray 
            }`
        )
        @view(`
            <div class="foo">Hello World</div>
        `)
        @component({
            name: 'style-order',
        })
        class Style {
        }

        $('body').append('<div id="test-style-order"></div>');

        let createdCallback  = storage.get(Style).get('@callbacks').get('created');
        let attachedCallback = storage.get(Style).get('@callbacks').get('attached');
        let detachedCallback = storage.get(Style).get('@callbacks').get('detached');

        let spy_style_created  = sinon.spy(createdCallback,  0);
        let spy_style_attached = sinon.spy(attachedCallback, 0);
        let spy_style_detached = sinon.spy(detachedCallback, 0);

        let styleOrderCom = Style.create();
        $('#test-style-order').append(styleOrderCom);
        $('#test-style-order style-order').remove();
        $('#test-style-order').append(styleOrderCom);

        await delay(1);

        /**
         *  Test
         */
        spy_style_created.callCount.should.be.equal(1);
        spy_style_attached.callCount.should.be.equal(2);
        spy_style_detached.callCount.should.be.equal(1);

        // cleanup
        createdCallback[0].restore();
        attachedCallback[0].restore();
        detachedCallback[0].restore();

        $('#test-style-order').remove();

    });

});