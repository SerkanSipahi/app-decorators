import assert from 'assert-diff';
import { parse } from'./index';
import { it } from './simple-it';
import 'should';

String.prototype.r = function() { return this.replace( /\s\s+/g, ' ') };
String.prototype.cs = function(){ return this.replace(/[\r\n]+/g, '').trim() };

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
        "@media on('load') {"+
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

it('should create "attachOn: mediaMatch" for type "media query"', () => {

    let styles =
        `@media only screen and (max-width:639px) and (orientation: portrait) {
            @fetch load/my/styles3.css;
        }`.r();


    let result = parse(styles);

    // should have correct length
    result.should.be.have.length(1);

    // Test 1
    result[0].styles = result[0].styles.cs(); // remove "new-lines"
    assert.deepEqual(result[0], {
        attachOn: "only screen and (max-width:639px) and (orientation: portrait)",
        imports: [
            "load/my/styles3.css",
        ],
        styles: "",
        type: "mediaMatch",
    });
});


it('should create "attachOn: on" with classes and @fetch', () => {

    let styles =
        "@media on('load') {"+
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
        "@media on('load') {"+
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

it('should create "attachOn: xxx" with classes and @media print', () => {

    let styles =
        "@media print {"+
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
        "@media (max-width: 1300px) {"+
            `@fetch load/my/styles2.css;
             @fetch load/my/styles3.css;`.r()+
        "}";

    let result = parse(styles);

    // should have correct length
    result.should.be.have.length(2);

    // Test 1
    result[0].styles = result[0].styles.cs(); // remove "new-lines"
    assert.deepEqual(result[0], {
        attachOn: "print",
        imports: [],
        styles: ".a { color: yellow; } .a .b { color: b; } .a .c { color: c; }",
        type: "mediaMatch",
    });

    // Test 2
    result[1].styles = result[1].styles.cs(); // remove "new-lines"
    assert.deepEqual(result[1], {
        attachOn: "(max-width: 1300px)",
        imports: [
            "load/my/styles2.css",
            "load/my/styles3.css"
        ],
        styles: "",
        type: "mediaMatch",
    });

});

it('should create "attachOn: myCustomEvent" with classes', () => {

    let styles =
        "@media on('myCustomEvent') {"+
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
        "@media on('click .my-button') {"+
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

it('should create "attachOn: action, load" when @media on and rel nested', () => {

    let styles =
        `.laz {
            width: 300px;
            .faz {
                right: 6px;
                @media on('load') {
                    height: 300px;
                }
                left: 3px;
                @media action('/a/{{dyn}}/c.html') {
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
        attachOn: "/a/{{dyn}}/c.html",
        imports: [],
        styles: ".laz .faz { display: flex }",
        type: "action",
    });
});

it('should match any @media expression', () => {

    let styles =
        `@media on('click .foo[a="c"] #foo[a][c="d"][e="s"].c') {
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
        `@media action('/this/{{value}}/path.html') {
            @fetch load/my111/styles11.css;
            @fetch load/my111/styles22.css;
        }`.r();

    let result = parse(styles);

    // should have correct length
    result.should.be.have.length(1);

    result[0].styles = result[0].styles.cs(); // remove "new-lines"
    assert.deepEqual(result[0], {
        attachOn: '/this/{{value}}/path.html',
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
        
        @media on('load') {
            @fetch to/my/src/file.css;
        }
        @media on('load') {
            @fetch to/my/src/file2.css;
        }
        .bar {
            background-color: red;
        }
        
        @fetch to/my/critical/path/file3.css;`.r();

    let result = parse(styles, { optimize: true });

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
        
        @media on('load') {
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
        
        @media on('load') {
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
        
        @media on('load') {
            @import load/my/styles1.css;
            .nut {
                color: magento;
            }
        }
        
        @media print {
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
        
        @media action('/a/{{dyn/c.html}}') {
            @fetch load/my777/styles7.css;
        }
        
        @media on('click .my-button') {
            @fetch load/my98/styles98.css;
        }
        
        @media on('myCustomEvent') {
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

        @media (max-width: 360px) {
            @fetch load/my/styles3.css;
        }

        @media only screen and (min-device-width:320px) and (max-device-width:639px) {
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
        attachOn: "print",
        imports: [],
        styles: ".a { color: yellow; } .a .b { color: b; } .a .c { color: c; }",
        type: "mediaMatch",
    });

    // Test 16
    result[15].styles = result[15].styles.cs();
    assert.deepEqual(result[15], {
        attachOn: "/a/{{dyn/c.html}}",
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
        attachOn: "(max-width: 360px)",
        imports: ["load/my/styles3.css"],
        styles: "",
        type: "mediaMatch",
    });

    // Test 20
    result[19].styles = result[19].styles.cs(); // remove "new-lines"
    assert.deepEqual(result[19], {
            attachOn: "only screen and (min-device-width:320px) and (max-device-width:639px)",
            imports: [],
            styles: ".lol { color: yellow; } .lol .b { color: b; } .lol .c { color: c; }",
            type: "mediaMatch",
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
        attachOn: "print",
        type: "mediaMatch",
        imports: [],
        styles: ".a { color: yellow; } .a .b { color: b; } .a .c { color: c; }"
    });


    result2[3].styles = result2[3].styles.cs();
    assert.deepEqual(result2[3], {
        attachOn: "/a/{{dyn/c.html}}",
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
        attachOn: "(max-width: 360px)",
        type: "mediaMatch",
        imports: ["load/my/styles3.css"],
        styles: ""
    });

    result2[7].styles = result2[7].styles.cs();
    assert.deepEqual(result2[7], {
        attachOn: "only screen and (min-device-width:320px) and (max-device-width:639px)",
        type: "mediaMatch",
        imports: [],
        styles: ".lol { color: yellow; } .lol .b { color: b; } .lol .c { color: c; }"
    });

    it.skip('should test css minify as option', () => {

    });

    it.skip('should test autoprefixer as option', () => {

    });

});

it.run();
