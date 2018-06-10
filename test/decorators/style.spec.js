import $ from 'jquery';
import _ from 'underscore';
import { bootstrapPolyfills } from '../../src/bootstrap';
import { delay } from '../../src/helpers/delay';
import { storage } from "../../src/libs/random-storage";
import '../../src/helpers/jquery.click-and-wait';

import sinon from 'sinon';

// init special innerHTML for test
String.prototype.cs = function(){return this.replace(/[\t\n\r ]+/gm, '');};
String.prototype.nlte = function(){ return this.replace(/[\t\r\n ]+/g, '').trim() };

describe('@style decorator', async () => {

    await bootstrapPolyfills;
    let { component, view, style, on } = await System.import('app-decorators');

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


    it('should contain stylesheets in element', () => {

        @style(`
            @on load {
                @fetch http://localhost:4000/styles/test-1.css;
                @fetch http://localhost:4000/styles/test-2.css;
            }
            style-collection-string {
                width: 100px;
                height: 100px;
            }
            .foo {
                color: red;
            }
        `)
        @view(`
            <div class="foo">Hello World</div>
        `)
        @component({
            name: 'style-collection-string',
        })
        class Style {
        }

        let element = Style.create();

        // should have correct length
        element.$stylesheets.should.be.have.length(2);

        // should have correct properties (0)
        element.$stylesheets[0]._styles = element.$stylesheets[0]._styles.nlte();
        element.$stylesheets[0]._attachOn.should.equal("immediately");
        element.$stylesheets[0]._imports.should.containDeep([]);
        element.$stylesheets[0]._styles.should.equal(
            "style-collection-string{width:100px;height:100px;}" +
            ".foo{color:red;}"
        );
        element.$stylesheets[0]._type.should.equal("default");

        // should have correct properties (1)
        element.$stylesheets[1]._attachOn.should.equal("load");
        element.$stylesheets[1]._imports.should.containDeep([
            "http://localhost:4000/styles/test-1.css",
            "http://localhost:4000/styles/test-2.css"
        ]);
        element.$stylesheets[1]._styles.should.equal("");
        element.$stylesheets[1]._type.should.equal("on");
    });

    it('should contain stylesheets once stylesheet when external resources', () => {

        @style(`
            @on load {
                @fetch http://localhost:4000/styles/test-1.css;
                @fetch http://localhost:4000/styles/test-2.css;
            }
            style-collection-string {
                width: 100px;
                height: 100px;
            }
            .foo {
                color: red;
            }
        `)
        @view(`
            <div class="foo">Hello World</div>
        `)
        @component({
            name: 'style-sheet-once',
        })
        class Style {
        }

        let element = Style.create();
        let element2 = Style.create();

        // shoul create only once stylesheet per component
        should(element.querySelectorAll('link').length).be.equal(2);
        should(element2.querySelectorAll('link').length).be.equal(0);

    });

    it('should render external resources (its failed when not comes quickly). So thats normal. Try again', async () => {

        @style(`
            @on load {
                @fetch http://localhost:4000/styles/test-1.css;
                @fetch http://localhost:4000/styles/test-2.css;
            }
            style-collection-string {
                width: 100px;
                height: 100px;
            }
            .foo {
                color: red;
            }
        `)
        @view(`
            <div class="foo">Hello World</div>
        `)
        @component({ name: 'style-external-resources' })
        class Style {
            @on('load:stylesheet') onLoadStylesheet(e){
                //console.log('load:stylesheet');
            }
        }

        let element = Style.create();
        let stylesheet = element.$stylesheets[0];

        let href1 = "http://localhost:4000/styles/test-1.css";
        let href2 = "http://localhost:4000/styles/test-2.css";
        let expected = `
        <style-external-resources rendered="true">
            <style class="style-order-0">
                style-collection-string { 
                    width: 100px; 
                    height: 100px; 
                } 
                .foo { 
                    color: red; 
                }
            </style>
            {{%LINK%}}
            <div class="foo">Hello World</div>
        </style-external-resources>`.nlte();

        document.body.appendChild(element);
        await delay(500);

        if(stylesheet.supportRelPreload()){
            //@TODO: remove inside of onload to helper functions
            expected = expected.replace('{{%LINK%}}', `
                <link rel="stylesheet" as="style" href="${href1}" onload="this.rel='stylesheet'; this.__event = new CustomEvent('load:stylesheet', { bubbles: true });this.dispatchEvent(this.__event)" class="style-order-1">
                <link rel="stylesheet" as="style" href="${href2}" onload="this.rel='stylesheet'; this.__event = new CustomEvent('load:stylesheet', { bubbles: true });this.dispatchEvent(this.__event)" class="style-order-1">`
            ).nlte();
            element.outerHTML.nlte().should.be.equal(expected);
        } else {
            expected = expected.replace('{{%LINK%}}', `
                <link rel="stylesheet" href="${href1}" media="all" class="style-order-1">
                <link rel="stylesheet" href="${href2}" media="all" class="style-order-1">`
            ).nlte();
            element.outerHTML.nlte().should.be.equal(expected);
        }

    });

    it('should create only once stylesheets no matter how often triggered (on, action)', async () => {

        @style(`
            @on load {
                @fetch http://localhost:4000/styles/test-1.css;
            }
            @on click .foo {
                @fetch http://localhost:4000/styles/test-2.css;
            }
            @action /a/b/{{value}}.html{
                @fetch http://localhost:4000/styles/test-3.css;
            }
            style-collection-string {
                width: 100px;
                height: 100px;
            }
            .foo {
                color: red;
            }
        `)
        @view(`
            <div class="foo">Hello World</div>
            <a class="bar" href="/a/b/c.html">Huhuu</a>
            <a class="baz" href="/a/b/d.html">Huhuu</a>
        `)
        @component({
            name: 'com-style-action',
        })
        class Style {
            @on('click .foo') onClickFoo(e){
            }
            @on('load:stylesheet') onLoadStylesheet(e){
            }
        }

        // Style.stub('onClickFoo', () => console.log('stubed'));

        let element = Style.create();
        document.body.appendChild(element);

        // round 1
        $('.foo', element).clickAndWait(30);
        $('.bar', element).clickAndWait(30);
        $('.baz', element).clickAndWait(30);
        // round 2
        $('.foo', element).clickAndWait(30);
        $('.bar', element).clickAndWait(30);
        $('.baz', element).clickAndWait(30);
        // round 3
        $('.foo', element).clickAndWait(30);
        $('.bar', element).clickAndWait(30);
        $('.baz', element).clickAndWait(30);

        await delay(50);

        should(element.querySelectorAll('style').length).be.equal(1);
        should(element.querySelectorAll('link').length).be.equal(3);

    });

    it('should create element 1,2,3 and then remove 1,2,3 + custom event that transfer event status to the next node', async () => {

        @style(`
            @on foo {
                @fetch http://localhost:4000/styles/test-1.css;
                @fetch http://localhost:4000/styles/test-2.css;
            }
            .foo { color: red }
        `)
        @view(`<div class="foo">Hello World</div>`)
        @component({
            name: 'com-multiple-appends',
        })
        class Style {
            // @fetch('/my/cool/endpoint/{{id}}', { type: 'get' }) getProducts({ response }) {
            //
            // }
        }

        /**
         * Test createdCount when its incremented
         */
        // first created element (element1) take the role of style and link
        let element1 = Style.create();
        document.body.appendChild(element1);
        let fooEvent = new Event('foo');
        element1.dispatchEvent(fooEvent);
        await delay(20);

        should(storage.get(Style).get('@style').get('referenceNodes').size).be.equal(1);
        should(element1.querySelectorAll('style').length).be.equal(1);
        should(element1.querySelectorAll('link').length).be.equal(2);

        // create element2
        let element2 = Style.create();
        document.body.appendChild(element2);
        should(storage.get(Style).get('@style').get('referenceNodes').size).have.equal(2);
        should(element2.querySelectorAll('style').length).be.equal(0);
        should(element2.querySelectorAll('link').length).be.equal(0);

        // create element3
        let element3 = Style.create();
        document.body.appendChild(element3);
        should(storage.get(Style).get('@style').get('referenceNodes').size).have.equal(3);
        should(element3.querySelectorAll('style').length).be.equal(0);
        should(element3.querySelectorAll('link').length).be.equal(0);

        // remove element1, so they lost there style and link
        $(element1).remove();
        await delay(20);
        should(storage.get(Style).get('@style').get('referenceNodes').size).have.equal(2);
        should(element1.querySelectorAll('style').length).be.equal(0);
        should(element1.querySelectorAll('link').length).be.equal(0);

        // element2, takes the role of styles, see style and link
        should(storage.get(Style).get('@style').get('referenceNodes').size).have.equal(2);
        should(element2.querySelectorAll('style').length).be.equal(1);
        should(element2.querySelectorAll('link').length).be.equal(2);

        // element3, nothing change
        should(element3.querySelectorAll('style').length).be.equal(0);
        should(element3.querySelectorAll('link').length).be.equal(0);

        // remove element2, so they lost there style and link
        $(element2).remove();
        await delay(20);
        should(storage.get(Style).get('@style').get('referenceNodes').size).have.equal(1);
        should(element2.querySelectorAll('style').length).be.equal(0);
        should(element2.querySelectorAll('link').length).be.equal(0);

        // element3, takes the role of styles, see style and link
        should(element3.querySelectorAll('style').length).be.equal(1);
        should(element3.querySelectorAll('link').length).be.equal(2);

        // remove element2, so they lost there style and link
        $(element3).remove();
        await delay(20);
        should(storage.get(Style).get('@style').get('referenceNodes').size).have.equal(0);
        should(element3.querySelectorAll('style').length).be.equal(0);
        should(element3.querySelectorAll('link').length).be.equal(0);

        // append element1 again to dom, they should take the role of style and link
        document.body.appendChild(element1);
        await delay(20);
        should(storage.get(Style).get('@style').get('referenceNodes').size).have.equal(1);
        should(element1.querySelectorAll('style').length).be.equal(1);
        should(element1.querySelectorAll('link').length).be.equal(2);

        // append element2 again to dom, they doesnt takes the role of style and link
        document.body.appendChild(element2);
        await delay(20);
        should(storage.get(Style).get('@style').get('referenceNodes').size).have.equal(2);
        // element1
        should(element1.querySelectorAll('style').length).be.equal(1);
        should(element1.querySelectorAll('link').length).be.equal(2);
        // element2
        should(element2.querySelectorAll('style').length).be.equal(0);
        should(element2.querySelectorAll('link').length).be.equal(0);

        $(element1).remove();
        $(element2).remove();
        await delay(20);
        should(storage.get(Style).get('@style').get('referenceNodes').size).have.equal(0);
        // element1
        should(element1.querySelectorAll('style').length).be.equal(0);
        should(element1.querySelectorAll('link').length).be.equal(0);
        // element2
        should(element2.querySelectorAll('style').length).be.equal(0);
        should(element2.querySelectorAll('link').length).be.equal(0);

        // create fresh element
        let element4 = Style.create();
        document.body.appendChild(element4);
        await delay(20);

        should(storage.get(Style).get('@style').get('referenceNodes').size).have.equal(1);

        // element1
        should(element1.querySelectorAll('style').length).be.equal(0);
        should(element1.querySelectorAll('link').length).be.equal(0);
        // element2
        should(element2.querySelectorAll('style').length).be.equal(0);
        should(element2.querySelectorAll('link').length).be.equal(0);

        // element4
        should(element4.querySelectorAll('style').length).be.equal(1);
        should(element4.querySelectorAll('link').length).be.equal(2);

    });

    it('should create element 1,2,3 and then remove 3,2,1', async () => {

        @style(`
            @on foo {
                @fetch http://localhost:4000/styles/test-1.css;
                @fetch http://localhost:4000/styles/test-2.css;
            }
            .foo { color: red }
        `)
        @view(`<div class="foo">Hello World</div>`)
        @component({
            name: 'com-multiple-appends-a',
        })
        class Style {}

        /**
         * Test createdCount when its incremented
         */
        // first created element (element1) take the role of style and link
        let element1 = Style.create();
        document.body.appendChild(element1);
        let fooEvent = new Event('foo');
        element1.dispatchEvent(fooEvent);
        await delay(20);

        should(storage.get(Style).get('@style').get('referenceNodes').size).be.equal(1);
        should(element1.querySelectorAll('style').length).be.equal(1);
        should(element1.querySelectorAll('link').length).be.equal(2);

        // create element2
        let element2 = Style.create();
        document.body.appendChild(element2);
        should(storage.get(Style).get('@style').get('referenceNodes').size).have.equal(2);
        should(element2.querySelectorAll('style').length).be.equal(0);
        should(element2.querySelectorAll('link').length).be.equal(0);
        await delay(20);

        // create element3
        let element3 = Style.create();
        document.body.appendChild(element3);
        should(storage.get(Style).get('@style').get('referenceNodes').size).have.equal(3);
        should(element3.querySelectorAll('style').length).be.equal(0);
        should(element3.querySelectorAll('link').length).be.equal(0);
        await delay(20);

        // remove 3
        $(element3).remove();
        await delay(20);
        should(storage.get(Style).get('@style').get('referenceNodes').size).have.equal(2);
        // check status of 3,2,1
        // element3
        should(element3.querySelectorAll('style').length).be.equal(0);
        should(element3.querySelectorAll('link').length).be.equal(0);
        // element2
        should(element2.querySelectorAll('style').length).be.equal(0);
        should(element2.querySelectorAll('link').length).be.equal(0);
        // element1
        should(element1.querySelectorAll('style').length).be.equal(1);
        should(element1.querySelectorAll('link').length).be.equal(2);

        // remove 2
        $(element2).remove();
        await delay(20);
        should(storage.get(Style).get('@style').get('referenceNodes').size).have.equal(1);
        // check status of 3,2,1
        // element3
        should(element3.querySelectorAll('style').length).be.equal(0);
        should(element3.querySelectorAll('link').length).be.equal(0);
        // element2
        should(element2.querySelectorAll('style').length).be.equal(0);
        should(element2.querySelectorAll('link').length).be.equal(0);
        // element1
        should(element1.querySelectorAll('style').length).be.equal(1);
        should(element1.querySelectorAll('link').length).be.equal(2);

        // remove 3
        $(element1).remove();
        await delay(20);
        should(storage.get(Style).get('@style').get('referenceNodes').size).have.equal(0);
        // check status of 3,2,1
        // element3
        should(element3.querySelectorAll('style').length).be.equal(0);
        should(element3.querySelectorAll('link').length).be.equal(0);
        // element2
        should(element2.querySelectorAll('style').length).be.equal(0);
        should(element2.querySelectorAll('link').length).be.equal(0);
        // element1
        should(element1.querySelectorAll('style').length).be.equal(0);
        should(element1.querySelectorAll('link').length).be.equal(0);

        // add element 2 again
        document.body.appendChild(element2);
        await delay(20);
        should(storage.get(Style).get('@style').get('referenceNodes').size).have.equal(1);
        // check status of 3,2,1
        // element3
        should(element3.querySelectorAll('style').length).be.equal(0);
        should(element3.querySelectorAll('link').length).be.equal(0);
        // element2
        should(element2.querySelectorAll('style').length).be.equal(1);
        should(element2.querySelectorAll('link').length).be.equal(2);
        // element1
        should(element1.querySelectorAll('style').length).be.equal(0);
        should(element1.querySelectorAll('link').length).be.equal(0);

        // remove element 2 again
        $(element2).remove();
        await delay(20);
        should(storage.get(Style).get('@style').get('referenceNodes').size).have.equal(0);
        // check status of 3,2,1
        // element3
        should(element3.querySelectorAll('style').length).be.equal(0);
        should(element3.querySelectorAll('link').length).be.equal(0);
        // element2
        should(element2.querySelectorAll('style').length).be.equal(0);
        should(element2.querySelectorAll('link').length).be.equal(0);
        // element1
        should(element1.querySelectorAll('style').length).be.equal(0);
        should(element1.querySelectorAll('link').length).be.equal(0);

        let element4 = Style.create();
        document.body.appendChild(element4);
        document.body.appendChild(element1);
        document.body.appendChild(element2);
        document.body.appendChild(element3);

        await delay(20);
        should(storage.get(Style).get('@style').get('referenceNodes').size).have.equal(4);
        // check status of 4, 3,2,1
        // element4
        should(element4.querySelectorAll('style').length).be.equal(1);
        should(element4.querySelectorAll('link').length).be.equal(2);
        // element3
        should(element3.querySelectorAll('style').length).be.equal(0);
        should(element3.querySelectorAll('link').length).be.equal(0);
        // element2
        should(element2.querySelectorAll('style').length).be.equal(0);
        should(element2.querySelectorAll('link').length).be.equal(0);
        // element1
        should(element1.querySelectorAll('style').length).be.equal(0);
        should(element1.querySelectorAll('link').length).be.equal(0);

    });

    it('should create element with styles', async () => {

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
                'com-style-basic .foo { ' +
                    'color: blue' +
                ' }' +
            '</style>' +
            '<div class="foo">Hello World</div>' +
        '</com-style-basic>';

        let expectedHTMLWhenRemoved = '<com-style-basic rendered="true"><div class="foo">HelloWorld</div></com-style-basic>';

        /**
         * Test
         */

        element.outerHTML.cs().should.be.equal(expectedHTML.cs());

        $('#test-style-order').append(element);
        should($('#test-style-order com-style-basic').get(0).outerHTML.cs()).be.equal(expectedHTML.cs());

        $(element, '#test-style-order').remove(); await delay(1);
        should($(element, '#test-style-order').get(0).outerHTML.cs()).be.equal(expectedHTMLWhenRemoved.cs());

        $('#test-style-order').append(element); await delay(1);
        should($('#test-style-order com-style-basic').get(0).outerHTML.cs()).be.equal(expectedHTML.cs());

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
        style1.outerHTML.cs().should.be.equal(('' +
        '<com-once-style rendered="true">' +
            '<style class="style-order-0">.foo { color: blue }</style>' +
            '<div class="foo">Hello World</div>' +
        '</com-once-style>').cs());

        let style2 = Style.create();
        style2.outerHTML.cs().should.be.equal(('' +
        '<com-once-style rendered="true">' +
            '<div class="foo">Hello World</div>' +
        '</com-once-style>').cs());

        let style3 = Style.create();
        style3.outerHTML.cs().should.be.equal(('' +
        '<com-once-style rendered="true">' +
            '<div class="foo">Hello World</div>' +
        '</com-once-style>').cs());

        /**
         * com-once-style2
         */
        let style2_1 = Style2.create();
        style2_1.outerHTML.cs().should.be.equal(('' +
        '<com-once-style2 rendered="true">' +
            '<style class="style-order-0">.baz { color: red }</style>' +
            '<div class="foo">Hello Mars</div>' +
        '</com-once-style2>').cs());

        let style2_2 = Style2.create();
        style2_2.outerHTML.cs().should.be.equal(('' +
        '<com-once-style2 rendered="true">' +
            '<div class="foo">Hello Mars</div>' +
        '</com-once-style2>').cs());

        let style2_3 = Style2.create();
        style2_3.outerHTML.cs().should.be.equal(('' +
        '<com-once-style2 rendered="true">' +
            '<div class="foo">Hello Mars</div>' +
        '</com-once-style2>').cs());

    });

});