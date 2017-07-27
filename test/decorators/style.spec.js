import $ from 'jquery';
import { bootstrapPolyfills } from '../../src/bootstrap';
import { delay } from '../../src/helpers/delay';
import { storage } from "../../src/libs/random-storage";

import sinon from 'sinon';

// init special innerHTML for test
String.prototype.removeGutter = function(){
    return this.replace(/[\t\n\r]/gm, '');
};

describe('@style decorator', async () => {

    await bootstrapPolyfills;
    let { component, view, style } = await System.import('app-decorators');

    beforeEach(() =>
        $('body').append('<div id="test-style-order"></div>')
    );

    afterEach(() =>
        $('#test-style-order').remove()
    );

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

        /**
         *  Setup
         */
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
    });

    it('should create element with styles', () => {

        @style('com-style-basic .foo { color: blue }')
        @view('<div class="foo">Hello World</div>')
        @component({
            name: 'com-style-basic',
        })
        class Style {
        }

        /**
         *  Setup
         */

        let element = Style.create();
        let expectedHTML =
            '<com-style-basic rendered="true">' +
                '<style>' +
                    'com-style-basic .foo {' +
                        ' color: blue ' +
                    '}' +
                '</style>' +
                '<div class="foo">Hello World</div>' +
            '</com-style-basic>';

        /**
         * Test
         */

        element.outerHTML.should.be.equal(expectedHTML);

        $('#test-style-order').append(element);
        should($('#test-style-order com-style-basic').get(0).outerHTML).be.equal(expectedHTML);

        $('#test-style-order').remove('com-style-basic');
        should($('#test-style-order com-style-basic').get(0).outerHTML).be.equal(expectedHTML);

        $('#test-style-order').append(element);
        should($('#test-style-order com-style-basic').get(0).outerHTML).be.equal(expectedHTML);
    });

    it('should create style element in order of document.readyState', () => {

        @style([
            {
                attachOn: 'immediately',
                type: 'default',
                imports: [],
                styles:
                    '.foo {' +
                        'color: blue;' +
                    '}',
            },
            {
                attachOn: 'DOMContentLoaded',
                type: 'on',
                imports: [],
                styles:
                    '.bar {' +
                        'color: red;' +
                    '}',
            },
            {
                attachOn: 'load',
                type: 'on',
                imports: [],
                styles:
                    '.baz {' +
                        'color: green;' +
                    '}',
            }
        ])
        @view('<div class="foo">Hello World</div>')
        @component({
            name: 'com-style-collection',
        })
        class Style {
        }


        $('body').append('<div class="test-style-order"></div>');

        /**
         *  Setup
         */

        let element = Style.create();
        let expectedHTML =
            '<com-style-collection rendered="true">' +
                '<style>' +
                    '.foo {' +
                        'color: blue;' +
                    '}' +
                '</style>' +
                '<style>' +
                    '.baz {' +
                        'color: green;' +
                    '}' +
                '</style>' +
                '<style>' +
                    '.bar {' +
                        'color: red;' +
                    '}' +
                '</style>' +
                '<div class="foo">Hello World</div>' +
            '</com-style-collection>';

        /**
         * Test
         */
        element.outerHTML.should.be.equal(expectedHTML);

    });

});