import assert from 'assert-diff';
import { it } from './simple-it';
import 'should';

import {
    parse,
    matchRadiusQueryRule,
    escapeAtRuleQueryVars,
    unescapeAtRuleQueryVars,
    createEventHandlerValue,
    createEventHandlerNameByAtRule
} from'./index';

String.prototype.r = function() { return this.replace( /\s\s+/g, ' ') };
String.prototype.cs = function(){ return this.replace(/[\r\n]+/g, '').trim() };

it('should escape and unescape atrule query vars', () => {

    // Test 1
    let result = escapeAtRuleQueryVars("/a/{{value}}/c.html");
    result.should.be.equal("/a/\\{\\{value\\}\\}/c.html");
    unescapeAtRuleQueryVars(result).should.be.equal("/a/{{value}}/c.html");

    // Test 2
    result = escapeAtRuleQueryVars("/a/{{foo}}/{{bar}}/c.html");
    result.should.be.equal("/a/\\{\\{foo\\}\\}/\\{\\{bar\\}\\}/c.html");
    unescapeAtRuleQueryVars(result).should.be.equal("/a/{{foo}}/{{bar}}/c.html");
});

it('should match atrule query', () => {

    let result = matchRadiusQueryRule('(radius: 31px) near (max-width:639px) and (orientation: portrait)');
    assert.deepEqual(result, {
        input: "(radius: 31px) near (max-width:639px) and (orientation: portrait)",
        option: ["radius", "31px"],
        rawPropQuery: "(radius: 31px) near ",
    });

    result = matchRadiusQueryRule('(max-width:639px) near (radius: 32px) ');
    assert.deepEqual(result, {
        input: "(max-width:639px) near (radius: 32px) ",
        option: ["radius", "32px"],
        rawPropQuery: " near (radius: 32px) ",
    });

    result = matchRadiusQueryRule('(radius: 33px) and (max-width:639px)');
    assert.deepEqual(result, {
        input: "(radius: 33px) and (max-width:639px)",
        option: ["radius", "33px"],
        rawPropQuery: "(radius: 33px) ",
    });

    result = matchRadiusQueryRule('com-footer near (radius: 34px)');
    assert.deepEqual(result, {
        input: "com-footer near (radius: 34px)",
        option: ["radius", "34px"],
        rawPropQuery: " near (radius: 34px)",
    });

    result = matchRadiusQueryRule('(radius: 35px)');
    assert.deepEqual(result, {
        input: "(radius: 35px)",
        option: ["radius", "35px"],
        rawPropQuery: "(radius: 35px)",
    });

    result = matchRadiusQueryRule('( radius : 36px   )  ');
    assert.deepEqual(result, {
        input: "( radius : 36px   )  ",
        option: ["radius", "36px"],
        rawPropQuery: "( radius : 36px   )  ",
    });

    result = matchRadiusQueryRule('   (radius :38px)');
    assert.deepEqual(result, {
        input: "   (radius :38px)",
        option: ["radius", "38px"],
        rawPropQuery: "   (radius :38px)",
    });

    result = matchRadiusQueryRule('(radius:39px)     ');
    assert.deepEqual(result, {
        input: "(radius:39px)     ",
        option: ["radius", "39px"],
        rawPropQuery: "(radius:39px)     ",
    });

    result = matchRadiusQueryRule('(max-width:639px) and (orientation: portrait)');
    assert.deepEqual(result, {
        input: null,
        option: null,
        rawPropQuery: null,
    });
});

it('should create eventName by passed in createEventHandlerValue', () => {

    createEventHandlerValue('hello').should.be.equal('hello hello');
    createEventHandlerValue('.foo .bar .baz').should.be.equal('.foo-.bar-.baz .foo .bar .baz');

});

it('should create eventName by passed in createEventHandlerNameByAtRule', () => {

    createEventHandlerNameByAtRule('query', "(max-width:639px) x").should.be.equal('(max-width:639px)-x (max-width:639px) x');
    createEventHandlerNameByAtRule('query', "(max-width:639px)").should.be.equal('(max-width:639px) (max-width:639px)');

    createEventHandlerNameByAtRule('viewport', "com-footer").should.be.equal('com-footer com-footer');
    createEventHandlerNameByAtRule('viewport', "com-footer .foo").should.be.equal('com-footer-.foo com-footer .foo');

    createEventHandlerNameByAtRule('on', "click").should.be.equal('click');
    createEventHandlerNameByAtRule('on', "click .foo .bar .baz").should.be.equal('click .foo .bar .baz');

    createEventHandlerNameByAtRule('action', "/a/b/c.html").should.be.equal('/a/b/c.html /a/b/c.html');
    createEventHandlerNameByAtRule('action', "/a/{{foo}}/{{bar}}/c.html").should.be.equal('/a/{{foo}}/{{bar}}/c.html /a/{{foo}}/{{bar}}/c.html');

});

it('should create "attachOn: immediately" objects', () => {

    /**
     * "\n" (newlines) will be created by postcss
     * and thats is correct!
     */
    let fooClass =
        '.foo {'+
            'color: gray;'+
        '} \n',
        barClass =
        '#foo {'+
            'color: gray;'+
        '} \n' ,
        bazClass =
        'foo {'+
            'color: gray;'+
        '} \n' ;

    let styles =
        fooClass+
        barClass+
        bazClass;

    let result = parse(styles);

    // should have correct length
    result.should.be.have.length(3);

    // should have correct properties
    assert.deepEqual(result[0], {
        attachOn: "immediately",
        imports: [],
        styles: fooClass,
        type: "default",
    });

    assert.deepEqual(result[1], {
        attachOn: "immediately",
        imports: [],
        styles: barClass,
        type: "default",
    });

    assert.deepEqual(result[2], {
        attachOn: "immediately",
        imports: [],
        styles: bazClass,
        type: "default",
    });

});

it('should create "attachOn: on" with classes', () => {

    let styles =
        "@on load {"+
            `.foo {
                color: violette;
                .bar {
                    color: gray;
                }
            }
            .baz {
                color: serkan;
            }`.r()+
        "}";

    let result = parse(styles);

    // should have correct length
    result.should.be.have.length(1);

    // Test 1
    result[0].styles = result[0].styles.cs(); // remove "new-lines"
    assert.deepEqual(result[0], {
        attachOn: "load",
        imports: [],
        styles: ".foo { color: violette; } .foo .bar { color: gray; } .baz { color: serkan; }",
        type: "on",
    });

});

it('should create "attachOn: immediately" with only @fetch on root layer', () => {

    let styles =
        `@fetch load/my111/styles4.css;
         @fetch load/my111/styles5.css;`.r();

        let result = parse(styles);

        // should have correct length
        result.should.be.have.length(2);

        // Test 1
        result[0].styles = result[0].styles.cs(); // remove "new-lines"
        assert.deepEqual(result[0], {
            attachOn: "immediately",
            imports: [
                "load/my111/styles4.css",
            ],
            styles: "",
            type: "default",
        });

        result[1].styles = result[1].styles.cs(); // remove "new-lines"
        assert.deepEqual(result[1], {
            attachOn: "immediately",
            imports: [
                "load/my111/styles5.css"
            ],
            styles: "",
            type: "default",
        });

});

it('import', () => {
    let styles =
        `.a {
            color: green;
        }
        @import a/b/c.css;
        .b {
            height: 100px;
        }`.r();

    let result = parse(styles);

    // should have correct length
    result.should.be.have.length(3);

    // Test 1
    result[0].styles = result[0].styles.cs(); // remove "new-lines"
    assert.deepEqual(result[0], {
        attachOn: "immediately",
        imports: [],
        styles: ".a { color: green; }",
        type: "default",
    });

    // Test 2
    result[1].styles = result[1].styles.cs(); // remove "new-lines"
    assert.deepEqual(result[1], {
        attachOn: "immediately",
        imports: [],
        styles: ".b { height: 100px; }",
        type: "default",
    });

    // Test 3
    result[2].styles = result[2].styles.cs(); // remove "new-lines"
    assert.deepEqual(result[2], {
        attachOn: "immediately",
        imports: [],
        styles: "@import a/b/c.css",
        type: "default",
    });
});

it('should create correct eventName by passed atrule', () => {

    let styles = `
        @query (max-width:639px) {
            @fetch load/my/styles11.css;
        }
        @query (max-width:639px) and (orientation: portrait) {
            @fetch load/my/styles11.css;
        }
        @query (radius: 30px) near (max-width:639px) and x {
            @fetch load/my/styles11.css;
        }
        `.r();

    let result = parse(styles);
    result[0].attachOn.should.be.equal('(max-width:639px) (max-width:639px)');
    result[1].attachOn.should.be.equal('(max-width:639px)-and-(orientation:-portrait) (max-width:639px) and (orientation: portrait)');
    result[2].attachOn.should.be.equal('(max-width:639px)-and-x (max-width:639px) and x');

    styles = `
        @viewport com-footer {
            @fetch load/my/styles8.css;
        }
        @viewport com-footer near (radius: 30px) {
            @fetch load/my/styles8.css;
        }
        @viewport com-footer .bar .baz near (radius: 30px) {
            @fetch load/my/styles8.css;
        }
        `.r();

    result = parse(styles);
    result[0].attachOn.should.be.equal('com-footer com-footer');
    result[1].attachOn.should.be.equal('com-footer com-footer');
    result[2].attachOn.should.be.equal('com-footer-.bar-.baz com-footer .bar .baz');

    styles = `
        @on click {
            @fetch load/my/styles31.css;
        }
        @on click .foo .bar .baz {
            @fetch load/my/styles31.css;
        }
        `.r();

    result = parse(styles);
    result[0].attachOn.should.be.equal('click');
    result[1].attachOn.should.be.equal('click .foo .bar .baz');

    styles = `
        @action /a/b/c.html {
            @fetch load/my/styles4.css;
        }        
        @action /a/{{foo}}/{{bar}}/c.html {
            @fetch load/my/styles6.css;
        }
        @action someEvent /a/{{value}}/c.html {
            @fetch load/my/styles5.css;
        }
        `.r();

    result = parse(styles);
    result[0].attachOn.should.be.equal('/a/b/c.html /a/b/c.html');
    result[1].attachOn.should.be.equal('/a/{{foo}}/{{bar}}/c.html /a/{{foo}}/{{bar}}/c.html');

});

it('should with and without optimize between query, on action and viewport when radius near property', () => {

    let styles = `
        @query (max-width:639px) and (orientation: portrait) {
            @fetch load/my/styles11.css;
            @import load/my/styles12.css;
        }
        
        @query (radius: 76px) near (max-width:639px) and (orientation: portrait) {
            @fetch load/my/styles837.css;
        }
        @query (max-width:330px) and (orientation: portrait) near (radius: 31px) {
            @fetch load/my/styles222.css;
        }
        @query (max-width:639px) and (orientation: portrait) near (radius: 76px) {
            @fetch load/my/styles333.css;
        }
        
        @on click .foo .bar .baz {
            .lu {
                color: red;
                font: arial;
            }
            @fetch load/my/styles31.css;
            @fetch load/my/styles21.css;
            .laz {
                width: 100px;
            }
        }
        @action /a/b/c.html {
            @fetch load/my/styles4.css;
        }        
        @action someEvent /a/{{value}}/c.html {
            @fetch load/my/styles5.css;
        }
        @action /a/{{foo}}/{{bar}}/c.html {
            @fetch load/my/styles6.css;
        }
        @action /a/{{foo}}/{{bar}}/c.html {
            @fetch load/my/styles71.css;
            @fetch load/my/styles72.js;
        }
        @viewport com-footer near (radius: 30px) {
            @fetch load/my/styles8.css;
        }
        `.r();

    let result = parse(styles);

    // should have correct length
    result.should.be.have.length(10);

    /**
     * Test without optimize
     */
    result[0].styles = result[0].styles.cs(); // remove "new-lines"
    assert.deepEqual(result[0], {
        attachOn:
        "(max-width:639px)-and-(orientation:-portrait)"+ " "+
        "(max-width:639px) and (orientation: portrait)",
        imports: [
            "load/my/styles11.css",
        ],
        styles: "@import load/my/styles12.css",
        type: "query",
    });

    result[1].styles = result[1].styles.cs(); // remove "new-lines"
    assert.deepEqual(result[1], {
        attachOn:
        "(max-width:639px)-and-(orientation:-portrait)"+ " "+
        "(max-width:639px) and (orientation: portrait)",
        imports: [
            "load/my/styles837.css",
        ],
        styles: "",
        option: ["radius", "76px"],
        type: "query",
    });

    result[2].styles = result[2].styles.cs(); // remove "new-lines"
    assert.deepEqual(result[2], {
        attachOn:
        "(max-width:330px)-and-(orientation:-portrait)"+ " "+
        "(max-width:330px) and (orientation: portrait)",
        imports: [
            "load/my/styles222.css",
        ],
        styles: "",
        option: ["radius", "31px"],
        type: "query",
    });

    result[3].styles = result[3].styles.cs(); // remove "new-lines"
    assert.deepEqual(result[3], {
        attachOn:
        "(max-width:639px)-and-(orientation:-portrait)"+ " "+
        "(max-width:639px) and (orientation: portrait)",
        imports: [
            "load/my/styles333.css",
        ],
        styles: "",
        option: ["radius", "76px"],
        type: "query",
    });

    result[4].styles = result[4].styles.cs(); // remove "new-lines"
    assert.deepEqual(result[4], {
        attachOn: "click .foo .bar .baz",
        imports: [
            "load/my/styles31.css",
            "load/my/styles21.css"
        ],
        styles: ".lu { color: red; font: arial; } .laz { width: 100px; }",
        type: "on",
    });

    result[5].styles = result[5].styles.cs(); // remove "new-lines"
    assert.deepEqual(result[5], {
        attachOn: "/a/b/c.html /a/b/c.html",
        imports: [
            "load/my/styles4.css"
        ],
        styles: "",
        type: "action",
    });

    result[6].styles = result[6].styles.cs(); // remove "new-lines"
    assert.deepEqual(result[6], {
        attachOn: "someEvent /a/{{value}}/c.html",
        imports: [
            "load/my/styles5.css"
        ],
        styles: "",
        type: "action",
    });

    result[7].styles = result[7].styles.cs(); // remove "new-lines"
    assert.deepEqual(result[7], {
        attachOn: "/a/{{foo}}/{{bar}}/c.html /a/{{foo}}/{{bar}}/c.html",
        imports: [
            "load/my/styles6.css"
        ],
        styles: "",
        type: "action",
    });

    result[8].styles = result[8].styles.cs(); // remove "new-lines"
    assert.deepEqual(result[8], {
        attachOn: "/a/{{foo}}/{{bar}}/c.html /a/{{foo}}/{{bar}}/c.html",
        imports: [
            "load/my/styles71.css",
            "load/my/styles72.js",
        ],
        styles: "",
        type: "action",
    });

    result[9].styles = result[9].styles.cs(); // remove "new-lines"
    assert.deepEqual(result[9], {
        attachOn: "com-footer com-footer",
        imports: [
            "load/my/styles8.css",
        ],
        styles: "",
        type: "viewport",
        option: ["radius", "30px"],
    });

    /**
     * Test with optimize ( just for looking option tag )
     */

    result = parse(styles, {optimize: true});

    result[0].styles = result[0].styles.cs(); // remove "new-lines"
    assert.deepEqual(result[0], {
        attachOn:
        "(max-width:639px)-and-(orientation:-portrait)"+ " "+
        "(max-width:639px) and (orientation: portrait)",
        imports: ["load/my/styles11.css"],
        styles: "@import load/my/styles12.css",
        type: "query",
    });

    result[1].styles = result[1].styles.cs(); // remove "new-lines"
    assert.deepEqual(result[1], {
        attachOn:
        "(max-width:639px)-and-(orientation:-portrait)"+ " "+
        "(max-width:639px) and (orientation: portrait)",
        imports: [
            "load/my/styles837.css",
            "load/my/styles333.css"
        ],
        styles: "",
        option: ["radius", "76px"],
        type: "query",
    });

    result[2].styles = result[2].styles.cs(); // remove "new-lines"
    assert.deepEqual(result[2], {
        attachOn:
        "(max-width:330px)-and-(orientation:-portrait)"+ " "+
        "(max-width:330px) and (orientation: portrait)",
        imports: [
            "load/my/styles222.css"
        ],
        styles: "",
        option: ["radius", "31px"],
        type: "query",
    });

    result[3].styles = result[3].styles.cs(); // remove "new-lines"
    assert.deepEqual(result[3], {
        attachOn: "click .foo .bar .baz",
        imports: [
            "load/my/styles31.css",
            "load/my/styles21.css"
        ],
        styles: ".lu { color: red; font: arial; } .laz { width: 100px; }",
        type: "on",
    });

    result[4].styles = result[4].styles.cs(); // remove "new-lines"
    assert.deepEqual(result[4], {
        attachOn: "/a/b/c.html /a/b/c.html",
        imports: [
            "load/my/styles4.css"
        ],
        styles: "",
        type: "action",
    });

    result[5].styles = result[5].styles.cs(); // remove "new-lines"
    assert.deepEqual(result[5], {
        attachOn: "someEvent /a/{{value}}/c.html",
        imports: [
            "load/my/styles5.css"
        ],
        styles: "",
        type: "action",
    });

    result[6].styles = result[6].styles.cs(); // remove "new-lines"
    assert.deepEqual(result[6], {
        attachOn: "/a/{{foo}}/{{bar}}/c.html /a/{{foo}}/{{bar}}/c.html",
        imports: [
            "load/my/styles6.css",
            "load/my/styles71.css",
            "load/my/styles72.js"
        ],
        styles: "",
        type: "action",
    });

    result[7].styles = result[7].styles.cs(); // remove "new-lines"
    assert.deepEqual(result[7], {
        attachOn: "com-footer com-footer",
        imports: [
            "load/my/styles8.css"
        ],
        styles: "",
        option: ["radius", "30px"],
        type: "viewport",
    });

});

it('should create "attachOn: query" for type "media query"', () => {

    let styles =
        `@query only screen and (max-width:639px) and (orientation: portrait) {
            @fetch load/my/styles3.css;
        }`.r();


    let result = parse(styles);

    // should have correct length
    result.should.be.have.length(1);

    // Test 1
    result[0].styles = result[0].styles.cs(); // remove "new-lines"
    assert.deepEqual(result[0], {
        attachOn:
            "only-screen-and-(max-width:639px)-and-(orientation:-portrait)"+ " "+
            "only screen and (max-width:639px) and (orientation: portrait)",
        imports: [
            "load/my/styles3.css",
        ],
        styles: "",
        type: "query",
    });
});

it('should create "attachOn: on" with classes and @fetch', () => {

    let styles =
        "@on load {"+
            `.a {
                color: red;
            }
            .b {
                color: blue;
            }
            @fetch load/my111/styles2.css;
            @fetch load/my111/styles3.css;
            .c {
                color: cologne;
            }`.r()+
        "}";

    let result = parse(styles);

    // should have correct length
    result.should.be.have.length(1);

    // Test 1
    result[0].styles = result[0].styles.cs(); // remove "new-lines"
    assert.deepEqual(result[0], {
        attachOn: "load",
        imports: [
            "load/my111/styles2.css",
            "load/my111/styles3.css"
        ],
        styles: ".a { color: red; } .b { color: blue; } .c { color: cologne; }",
        type: "on",
    });

});

it('should create "attachOn: on" with classes and @import', () => {

    let styles =
        "@on load {"+
            `@import "load/my/styles1.css";
            .nut {
                color: magento;
            }`.r()+
        "}";

    let result = parse(styles);

    // should have correct length
    result.should.be.have.length(1);

    // Test 1
    result[0].styles = result[0].styles.cs(); // remove "new-lines"
    assert.deepEqual(result[0], {
        attachOn: "load",
        imports: [],
        // @Fixme: may be wrong due import need trailing semicolon, but postcss remove it ?!?
        // @update: this is according standard not allowd. Grammer should throw error
        styles: '@import "load/my/styles1.css" .nut { color: magento; }',
        type: "on",
    });

});

it('should create "attachOn: xxx" with classes and @print', () => {

    let styles =
        "@query print {"+
            `.a {
                color: yellow;
                .b {
                    color: b;
                }
                .c {
                    color: c;
                }
            }`.r()+
        "}"+
        "@query (max-width: 1300px) {"+
            `@fetch load/my/styles2.css;
             @fetch load/my/styles3.css;`.r()+
        "}";

    let result = parse(styles);

    // should have correct length
    result.should.be.have.length(2);

    // Test 1
    result[0].styles = result[0].styles.cs(); // remove "new-lines"
    assert.deepEqual(result[0], {
        attachOn: "print print",
        imports: [],
        styles: ".a { color: yellow; } .a .b { color: b; } .a .c { color: c; }",
        type: "query",
    });

    // Test 2
    result[1].styles = result[1].styles.cs(); // remove "new-lines"
    assert.deepEqual(result[1], {
        attachOn: "(max-width:-1300px) (max-width: 1300px)",
        imports: [
            "load/my/styles2.css",
            "load/my/styles3.css"
        ],
        styles: "",
        type: "query",
    });

});

it('should create "attachOn: myCustomEvent" with classes', () => {

    let styles =
        "@on myCustomEvent {"+
            `.baz {
                width: 23px;
            }`.r()+
        "}";

    let result = parse(styles);

    // should have correct length
    result.should.be.have.length(1);

    // Test 1
    result[0].styles = result[0].styles.cs(); // remove "new-lines"
    assert.deepEqual(result[0], {
        attachOn: "myCustomEvent",
        imports: [],
        styles: ".baz { width: 23px; }",
        type: "on",
    });

});

it('should create "attachOn: on" with classes', () => {

    let styles =
        "@on click .my-button {"+
            `.foo {
                color: blue;
            }`.r()+
        "}";

    let result = parse(styles);

    // should have correct length
    result.should.be.have.length(1);

    // Test 1
    result[0].styles = result[0].styles.cs(); // remove "new-lines"
    assert.deepEqual(result[0], {
        attachOn: "click .my-button",
        imports: [],
        styles: ".foo { color: blue; }",
        type: "on",
    });

});

it('should create "attachOn: action, load" when @ on and rel nested', () => {

    let styles =
        `.laz {
            width: 300px;
            .faz {
                right: 6px;
                @on load {
                    height: 300px;
                }
                left: 3px;
                @action /a/{{dyn}}/c.html {
                    display: flex;
                }
            }
        }`.r();

    let result = parse(styles);

    // should have correct length
    result.should.be.have.length(4);

    // Test 1
    result[0].styles = result[0].styles.cs();
    assert.deepEqual(result[0], {
        attachOn: "immediately",
        imports: [],
        styles: ".laz { width: 300px; }",
        type: "default",
    });

    // Test 2

    result[1].styles = result[1].styles.cs();
    assert.deepEqual(result[1], {
        attachOn: "immediately",
        imports: [],
        styles: ".laz .faz { right: 6px; left: 3px; }",
        type: "default",
    });

    // Test 3
    result[2].styles = result[2].styles.cs();
    assert.deepEqual(result[2], {
        attachOn: "load",
        imports: [],
        styles: ".laz .faz { height: 300px }",
        type: "on",
    });

    // Test 4
    result[3].styles = result[3].styles.cs();
    assert.deepEqual(result[3], {
        attachOn: "/a/{{dyn}}/c.html /a/{{dyn}}/c.html",
        imports: [],
        styles: ".laz .faz { display: flex }",
        type: "action",
    });
});

it('should match any @ expression', () => {

    let styles =
        `@on click .foo[a="c"] #foo[a][c="d"][e="s"].c {
            @fetch load/my/styles3.css;
        }`.r();

    let result = parse(styles);

    result[0].styles = result[0].styles.cs(); // remove "new-lines"
    assert.deepEqual(result[0], {
        attachOn: 'click .foo[a="c"] #foo[a][c="d"][e="s"].c',
        imports: ["load/my/styles3.css"],
        styles: "",
        type: "on",
    });
});

it('match action types', () => {

    let styles =
        `@action /this/{{value}}/path.html {
            @fetch load/my111/styles11.css;
            @fetch load/my111/styles22.css;
        }`.r();

    let result = parse(styles);

    // should have correct length
    result.should.be.have.length(1);

    result[0].styles = result[0].styles.cs(); // remove "new-lines"
    assert.deepEqual(result[0], {
        attachOn: '/this/{{value}}/path.html /this/{{value}}/path.html',
        imports: [
            "load/my111/styles11.css",
            "load/my111/styles22.css"
        ],
        styles: "",
        type: "action",
    });

});

it('should work correctly with optimize (mini integration)', () => {
    let styles = `
        .foo {
            background-color: red;
        }
        
        @on load {
            @fetch to/my/src/file.css;
        }
        @on load {
            @fetch to/my/src/file2.css;
        }
        .bar {
            background-color: red;
        }
        
        @fetch to/my/critical/path/file3.css;`.r();

    let result = parse(styles, { optimize: true, minify: false, autoprefixer: [] });

    result[0].styles = result[0].styles.cs();
    assert.deepEqual(result[0], {
        attachOn: 'immediately',
        imports: [
            "to/my/critical/path/file3.css"
        ],
        styles: "" +
            ".foo { background-color: red; } " +
            ".bar { background-color: red; }",
        type: "default",
    });

    result[1].styles = result[1].styles.cs();
    assert.deepEqual(result[1], {
        attachOn: 'load',
        imports: [
            "to/my/src/file.css",
            "to/my/src/file2.css"
        ],
        styles: "",
        type: "on",
    });

});

it.skip('match fetch types', () => {

    /**
     * Very useful if you want to apply your css while downloading
     * and not applying after its downloaded!
     * https://jakearchibald.com/2016/streams-ftw/
     */

    let styles = `@fetch load/my/styles3.css!stream`;

    //let result = parse(styles);

});

it.skip('should parse mediaQuery inline statements according standard', () => {

    // https://developer.mozilla.org/de/docs/Web/CSS/@import

    let styles1 = `@fetch load/my/styles3.css only screen and (min-device-width:320px);`;

    let styles2 = `@fetch load/my/styles3.css on('load');`;

    let result = parse(styles1);

});

it.skip('depending on connecting and filesize it should decide whether stream or not', () => {

    // https://developer.mozilla.org/de/docs/Web/CSS/@import

    let styles1 = `@fetch load/my/styles3.css only screen and (min-device-width:320px);`;

    let styles2 = `@fetch load/my/styles3.css action('/a/{{foo}}/x.html');`;

    let result = parse(styles1);

});

it('integration test', () => {

    let styles =
        `.foo {
            color: gray;
        }
        .bar {
            .laz .kaz {
                color: blue;
            }
        }
        
        @import load/serkan/styles1.css;
        
        @fetch load/my111/styles1.css;
        @fetch load/my222/styles2.css;
        
        @on load {
            .foo {
                color: violette;
                .bar {
                    color: gray;
                }
            }
            
            @fetch load/my333/styles3.css;
            @fetch load/my444/styles4.css;
            
            .baz {
                color: serkan;
            }
        }
        
        @on load {
            .a {
                color: red;
            }
            .b {
                color: blue;
            }
            @fetch load/my555/styles5.css;
            @fetch load/my666/styles6.css;
            .c {
                color: cologne;
            }
        }
        
        @fetch load/my123/styles222.css;
        @fetch load/my456/styles333.css;
        
        @on load {
            @import load/my/styles1.css;
            .nut {
                color: magento;
            }
        }
        
        @query print {
            .a {
                color: yellow;
                .b {
                    color: b;
                }
                .c {
                    color: c;
                }
            }
        }
        
        @action /a/{{dyn/c.html}} {
            @fetch load/my777/styles7.css;
        }
        
        @on click .my-button {
            @fetch load/my98/styles98.css;
        }
        
        @on myCustomEvent {
            .baz {
                width: 23px;
            }
        }
        
        foo {
            color: black;
        }

        #foo {
            color: pink;
        }

        @query (max-width: 360px) {
            @fetch load/my/styles3.css;
        }

        @query only screen and (min-device-width:320px) and (max-device-width:639px) near (radius: 44px) {
            .lol {
                color: yellow;
                .b {
                    color: b;
                }
                .c {
                    color: c;
                }
            }
        }
        .beforeImport {
            color: green;
        }

        .afterImport {
            color: red;
        }`.r();

    let result = parse(styles);

    // should have correct length
    result.should.be.have.length(20);

    // Test 1
    result[0].styles = result[0].styles.cs();
    assert.deepEqual(result[0], {
        attachOn: "immediately",
        imports: [],
        styles: ".foo { color: gray; }",
        type: "default",
    });

    // Test 2
    result[1].styles = result[1].styles.cs();
    assert.deepEqual(result[1], {
        attachOn: "immediately",
        imports: [],
        styles: ".bar .laz .kaz { color: blue; }",
        type: "default",
    });

    // Test 3
    result[2].styles = result[2].styles.cs();
    assert.deepEqual(result[2], {
        attachOn: "immediately",
        imports: [],
        styles: "foo { color: black; }",
        type: "default",
    });

    // Test 4
    result[3].styles = result[3].styles.cs();
    assert.deepEqual(result[3], {
        attachOn: "immediately",
        imports: [],
        styles: "#foo { color: pink; }",
        type: "default",
    });

    // Test 5
    result[4].styles = result[4].styles.cs();
    assert.deepEqual(result[4], {
        attachOn: "immediately",
        imports: [],
        styles: ".beforeImport { color: green; }",
        type: "default",
    });

    // Test 6
    result[5].styles = result[5].styles.cs();
    assert.deepEqual(result[5], {
        attachOn: "immediately",
        imports: [],
        styles: ".afterImport { color: red; }",
        type: "default",
    });

    // Test 7
    result[6].styles = result[6].styles.cs();
    assert.deepEqual(result[6], {
        attachOn: "immediately",
        imports: [],
        styles: "@import load/serkan/styles1.css",
        type: "default",
    });

    // Test 8
    result[7].styles = result[7].styles.cs();
    assert.deepEqual(result[7], {
        attachOn: "immediately",
        imports: ["load/my111/styles1.css"],
        styles: "",
        type: "default",
    });

    // Test 9
    result[8].styles = result[8].styles.cs();
    assert.deepEqual(result[8], {
        attachOn: "immediately",
        imports: ["load/my222/styles2.css"],
        styles: "",
        type: "default",
    });

    // Test 10
    result[9].styles = result[9].styles.cs();
    assert.deepEqual(result[9], {
        attachOn: "load",
        imports: [
            "load/my333/styles3.css",
            "load/my444/styles4.css",
        ],
        styles: ".foo { color: violette; } .foo .bar { color: gray; } .baz { color: serkan; }",
        type: "on",
    });

    // Test 11
    result[10].styles = result[10].styles.cs();
    assert.deepEqual(result[10], {
        attachOn: "load",
        imports: [
            "load/my555/styles5.css",
            "load/my666/styles6.css"
        ],
        styles: ".a { color: red; } .b { color: blue; } .c { color: cologne; }",
        type: "on",
    });

    // Test 12
    result[11].styles = result[11].styles.cs();
    assert.deepEqual(result[11], {
        attachOn: "immediately",
        imports: ["load/my123/styles222.css"],
        styles: "",
        type: "default",
    });

    // Test 13
    result[12].styles = result[12].styles.cs();
    assert.deepEqual(result[12], {
        attachOn: "immediately",
        imports: ["load/my456/styles333.css"],
        styles: "",
        type: "default",
    });

    // Test 14
    result[13].styles = result[13].styles.cs();
    assert.deepEqual(result[13], {
        attachOn: "load",
        imports: [],
        styles: "@import load/my/styles1.css .nut { color: magento; }",
        type: "on",
    });

    // Test 15
    result[14].styles = result[14].styles.cs();
    assert.deepEqual(result[14], {
        attachOn: "print print",
        imports: [],
        styles: ".a { color: yellow; } .a .b { color: b; } .a .c { color: c; }",
        type: "query",
    });

    // Test 16
    result[15].styles = result[15].styles.cs();
    assert.deepEqual(result[15], {
        attachOn: "/a/{{dyn/c.html}} /a/{{dyn/c.html}}",
        imports: ["load/my777/styles7.css"],
        styles: "",
        type: "action",
    });

    // Test 17
    result[16].styles = result[16].styles.cs();
    assert.deepEqual(result[16], {
        attachOn: "click .my-button",
        imports: ["load/my98/styles98.css"],
        styles: "",
        type: "on",
    });

    // Test 18
    result[17].styles = result[17].styles.cs();
    assert.deepEqual(result[17], {
        attachOn: "myCustomEvent",
        imports: [],
        styles: ".baz { width: 23px; }",
        type: "on",
    });

    // Test 19
    result[18].styles = result[18].styles.cs();
    assert.deepEqual(result[18], {
        attachOn: "(max-width:-360px) (max-width: 360px)",
        imports: ["load/my/styles3.css"],
        styles: "",
        type: "query",
    });

    // Test 20
    result[19].styles = result[19].styles.cs(); // remove "new-lines"
    assert.deepEqual(result[19], {
        attachOn:
            "only-screen-and-(min-device-width:320px)-and-(max-device-width:639px)" + " " +
            "only screen and (min-device-width:320px) and (max-device-width:639px)",
        imports: [],
        styles: ".lol { color: yellow; } .lol .b { color: b; } .lol .c { color: c; }",
        type: "query",
        option: ["radius", "44px"],
    });

    /**
     *
     * @type {Array}
     */

    let result2 = parse(styles, { optimize: true });

    // should have correct length
    result2.should.be.have.length(8);

    // Test 1
    result2[0].styles = result2[0].styles.cs();
    assert.deepEqual(result2[0], {
        attachOn: "immediately",
        type: "default",
        imports: [
            "load/my111/styles1.css",
            "load/my222/styles2.css",
            "load/my123/styles222.css",
            "load/my456/styles333.css",
        ],
        styles: "" +
            ".foo { color: gray; } " +
            ".bar .laz .kaz { color: blue; } " +
            "foo { color: black; } " +
            "#foo { color: pink; } " +
            ".beforeImport { color: green; } " +
            ".afterImport { color: red; } " +
            "@import load/serkan/styles1.css",
    });

    result2[1].styles = result2[1].styles.cs();
    assert.deepEqual(result2[1], {
        attachOn: "load",
        type: "on",
        imports: [
            "load/my333/styles3.css",
            "load/my444/styles4.css",
            "load/my555/styles5.css",
            "load/my666/styles6.css",
        ],
        styles: "" +
            ".foo { color: violette; } " +
            ".foo .bar { color: gray; } " +
            ".baz { color: serkan; }  " +
            ".a { color: red; } " +
            ".b { color: blue; } " +
            ".c { color: cologne; }  " +
            "@import load/my/styles1.css " +
            ".nut { color: magento; }",
    });

    result2[2].styles = result2[2].styles.cs();
    assert.deepEqual(result2[2], {
        attachOn: "print print",
        type: "query",
        imports: [],
        styles: ".a { color: yellow; } .a .b { color: b; } .a .c { color: c; }"
    });


    result2[3].styles = result2[3].styles.cs();
    assert.deepEqual(result2[3], {
        attachOn: "/a/{{dyn/c.html}} /a/{{dyn/c.html}}",
        type: "action",
        imports: ["load/my777/styles7.css"],
        styles: ""
    });

    result2[4].styles = result2[4].styles.cs();
    assert.deepEqual(result2[4], {
        attachOn: "click .my-button",
        type: "on",
        imports: ["load/my98/styles98.css"],
        styles: ""
    });

    result2[5].styles = result2[5].styles.cs();
    assert.deepEqual(result2[5], {
        attachOn: "myCustomEvent",
        type: "on",
        imports: [],
        styles: ".baz { width: 23px; }"
    });

    result2[6].styles = result2[6].styles.cs();
    assert.deepEqual(result2[6], {
        attachOn: "(max-width:-360px) (max-width: 360px)",
        type: "query",
        imports: ["load/my/styles3.css"],
        styles: ""
    });

    result2[7].styles = result2[7].styles.cs();
    assert.deepEqual(result2[7], {
        attachOn:
            "only-screen-and-(min-device-width:320px)-and-(max-device-width:639px)" + " " +
            "only screen and (min-device-width:320px) and (max-device-width:639px)" ,
        type: "query",
        imports: [],
        styles: ".lol { color: yellow; } .lol .b { color: b; } .lol .c { color: c; }",
        option: ["radius", "44px"],
    });

    it.skip('should test css minify as option', () => {

    });

    it.skip('should test autoprefixer as option', () => {

    });

});

it.run();
