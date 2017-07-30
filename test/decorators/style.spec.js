import $ from 'jquery';
import { bootstrapPolyfills } from '../../src/bootstrap';
import { delay } from '../../src/helpers/delay';
import { storage } from "../../src/libs/random-storage";

import sinon from 'sinon';

// init special innerHTML for test
String.prototype.removeGutter = function(){
    return this.replace(/[\t\n\r]+/gm, '');
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
            '<style class="style-order-0">' +
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

    it('should create style element in order of pass array with only styles', () => {

        @style([
            {
                attachOn: 'load',
                type: 'on',
                imports: [],
                styles:
                '.baz {' +
                    'color: green;' +
                '}',
            },
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
            '<style class="style-order-0">' +
                '.baz {' +
                    'color: green;' +
                '}' +
            '</style>' +
            '<style class="style-order-1">' +
                '.foo {' +
                    'color: blue;' +
                '}' +
            '</style>' +
            '<style class="style-order-2">' +
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


    it('should create style element in order of pass array styles and link-rel', done => {

        @style([
            {
                attachOn: 'load',
                type: 'on',
                imports: ["a.css", "b.css", "c.css"],
                styles: '.baz {color: green;}',
            },
            {
                attachOn: 'load',
                type: 'lala',
                imports: ["e.css", "f.css"],
                styles: '.laz {color: green;}',
            },
            {
                attachOn: 'immediately',
                type: 'default',
                imports: [],
                styles: '.foo {color: blue;}',
            },
            {
                attachOn: 'immediately',
                type: 'default',
                imports: [],
                styles:'.naz {color: yellow;}',
            },
            {
                attachOn: 'DOMContentLoaded',
                type: 'on',
                imports: ["d.css"],
                styles:'.bar {color: red;}',
            },
        ], { fallback: true })
        @view('<div class="foo">Hello World</div>')
        @component({
            name: 'com-passed-array',
        })
        class Style {
        }

        let element = Style.create();
        element.innerhTML = '<header>Hello World</header>';
        setTimeout(() => {
            element.outerHTML.should.be.equal(
            '<com-passed-array rendered="true">' +
                '<style class="style-order-0">.baz {color: green;}</style>' +
                '<link rel="stylesheet" href="a.css" media="only x" class="style-order-0">' +
                '<link rel="stylesheet" href="b.css" media="only x" class="style-order-0">' +
                '<link rel="stylesheet" href="c.css" media="only x" class="style-order-0">' +
                '<style class="style-order-1">.laz {color: green;}</style>' +
                '<link rel="stylesheet" href="e.css" media="only x" class="style-order-1">' +
                '<link rel="stylesheet" href="f.css" media="only x" class="style-order-1">' +
                '<style class="style-order-2">.foo {color: blue;}</style>' +
                '<style class="style-order-3">.naz {color: yellow;}</style>' +
                '<style class="style-order-4">.bar {color: red;}</style>' +
                '<link rel="stylesheet" href="d.css" media="only x" class="style-order-4">' +
                '<div class="foo">Hello World</div>' +
            '</com-passed-array>');
            done();
        }, 500);

        element.dispatchEvent(new Event("lala"));

    });

    it('should create only once style element when creating many instances', () => {

        @style(`.foo { color: blue }`)
        @view(`<div class="foo">Hello World</div>`)
        @component({
            name: 'com-once-style',
        })
        class Style {
        }

        @style(`.baz { color: red }`)
        @view(`<div class="foo">Hello Mars</div>`)
        @component({
            name: 'com-once-style2',
        })
        class Style2 {
        }

        /**
         * com-once-style
         */
        let style1 = Style.create();
        style1.outerHTML.should.be.equal('' +
        '<com-once-style rendered="true">' +
            '<style class="style-order-0">.foo { color: blue }</style>' +
            '<div class="foo">Hello World</div>' +
        '</com-once-style>');

        let style2 = Style.create();
        style2.outerHTML.should.be.equal('' +
        '<com-once-style rendered="true">' +
            '<div class="foo">Hello World</div>' +
        '</com-once-style>');

        let style3 = Style.create();
        style3.outerHTML.should.be.equal('' +
        '<com-once-style rendered="true">' +
            '<div class="foo">Hello World</div>' +
        '</com-once-style>');

        /**
         * com-once-style2
         */
        let style2_1 = Style2.create();
        style2_1.outerHTML.should.be.equal('' +
        '<com-once-style2 rendered="true">' +
            '<style class="style-order-0">.baz { color: red }</style>' +
            '<div class="foo">Hello Mars</div>' +
        '</com-once-style2>');

        let style2_2 = Style2.create();
        style2_2.outerHTML.should.be.equal('' +
        '<com-once-style2 rendered="true">' +
            '<div class="foo">Hello Mars</div>' +
        '</com-once-style2>');

        let style2_3 = Style2.create();
        style2_3.outerHTML.should.be.equal('' +
        '<com-once-style2 rendered="true">' +
            '<div class="foo">Hello Mars</div>' +
        '</com-once-style2>');

    });

});