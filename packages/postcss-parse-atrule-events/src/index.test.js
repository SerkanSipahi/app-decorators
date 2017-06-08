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
        `@fetch load/my111/styles4.css!async;
         @fetch load/my111/styles5.css!defer;`.r();

        let result = parse(styles);

        // should have correct length
        result.should.be.have.length(2);

        // Test 1
        result[0].styles = result[0].styles.cs(); // remove "new-lines"
        assert.deepEqual(result[0], {
            attachOn: "immediately",
            imports: [
                "load/my111/styles4.css!async",
            ],
            styles: "",
            type: "default",
        });

        result[1].styles = result[1].styles.cs(); // remove "new-lines"
        assert.deepEqual(result[1], {
            attachOn: "immediately",
            imports: [
                "load/my111/styles5.css!defer"
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
        styles: "@import a/b/c.css",
        type: "default",
    });

    result[1].styles = result[1].styles.cs(); // remove "new-lines"
    assert.deepEqual(result[1], {
        attachOn: "immediately",
        imports: [],
        styles: ".a { color: green; }",
        type: "default",
    });

    result[2].styles = result[2].styles.cs(); // remove "new-lines"
    assert.deepEqual(result[2], {
        attachOn: "immediately",
        imports: [],
        styles: ".b { height: 100px; }",
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
            @fetch load/my111/styles2.css!async;
            @fetch load/my111/styles3.css!defer;
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
            "load/my111/styles2.css!async",
            "load/my111/styles3.css!defer",
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

it('should create "attachOn: preload" with only @fetch/s', () => {

    let styles =
        "@media rel('preload') {"+
            `@fetch load/my/styles2.css;
             @fetch load/my/styles3.css;
            `.r()+
        "}";

    let result = parse(styles);

    // should have correct length
    result.should.be.have.length(1);

    // Test 1
    result[0].styles = result[0].styles.cs(); // remove "new-lines"
    assert.deepEqual(result[0], {
        attachOn: "preload",
        imports: [
            "load/my/styles2.css",
            "load/my/styles3.css",
        ],
        styles: "",
        type: "rel",
    });

});

it('should create "attachOn: preload" with classes', () => {

    let styles =
        "@media rel('preload') {"+
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
        attachOn: "preload",
        imports: [],
        styles: ".foo { color: blue; }",
        type: "rel",
    });

});

it('should create "attachOn: preload, load" when @media on and rel nested', () => {

    let styles =
        `.laz {
            width: 300px;
            .faz {
                right: 6px;
                @media on('load') {
                    height: 300px;
                }
                left: 3px;
                @media rel('preload') {
                    display: flex;
                }
            }
        }`.r();

    let result = parse(styles);

    // should have correct length
    result.should.be.have.length(4);

    // Test 1
    result[0].styles = result[0].styles.cs(); // remove "new-lines"
    assert.deepEqual(result[0], {
        attachOn: "load",
        imports: [],
        styles: ".laz .faz { height: 300px }",
        type: "on",
    });

    // Test 2
    result[1].styles = result[1].styles.cs(); // remove "new-lines"
    assert.deepEqual(result[1], {
        attachOn: "preload",
        imports: [],
        styles: ".laz .faz { display: flex }",
        type: "rel",
    });

    // Test 3
    result[2].styles = result[2].styles.cs(); // remove "new-lines"
    assert.deepEqual(result[2], {
        attachOn: "immediately",
        imports: [],
        styles: ".laz { width: 300px; }",
        type: "default",
    });

    // Test 4
    result[3].styles = result[3].styles.cs(); // remove "new-lines"
    assert.deepEqual(result[3], {
        attachOn: "immediately",
        imports: [],
        styles: ".laz .faz { right: 6px; left: 3px; }",
        type: "default",
    });
});

it('should match any @media expression', () => {

    let styles =
        `@media on('click .foo[a="c"] #foo[a][c="d"][e="s"].c') {
            @fetch load/my/styles3.css!async;
        }`.r();

    let result = parse(styles);

    result[0].styles = result[0].styles.cs(); // remove "new-lines"
    assert.deepEqual(result[0], {
        attachOn: 'click .foo[a="c"] #foo[a][c="d"][e="s"].c',
        imports: ["load/my/styles3.css!async"],
        styles: "",
        type: "on",
    });
});

it('match fetch types', () => {

    /**
     * Very useful if you want to apply your css while downloading
     * and not applying after its downloaded!
     * https://jakearchibald.com/2016/streams-ftw/
     */

    let styles1 =
        `@fetch load/my/styles3.css
         @fetch load/my/styles3.css!defer;
         @fetch load/my/styles3.css!async;
         @fetch load/my/styles3.css!stream;`;

    //let result = parse(styles2);

});

it('should parse mediaQuery inline statements according standard', () => {

    // https://developer.mozilla.org/de/docs/Web/CSS/@import

    let styles1 =
        `@fetch load/my/styles3.css!async only screen and (min-device-width:320px);`;

    let styles2 =
        `@fetch load/my/styles3.css @media on('load');`;

    let styles3 =
        `@fetch load/my/styles3.css @media rel('preload');`;

    let result = parse(styles2);
    //console.log(result)

});

it('integration test', () => {

    let styles =
        `.foo {
            color: gray;
        }
        
        @media on('load') {
            .foo {
                color: violette;
                .bar {
                    color: gray;
                }
            }
            .baz {
                color: serkan;
            }
        }
        
        .laz {
            width: 300px;
            .faz {
                right: 6px;
                @media on('load') {
                    height: 300px;
                }
                left: 3px;
                @media rel('preload') {
                    display: flex;
                }
            }
        }
        
        @media on('load') {
            .a {
                color: red;
            }
            .b {
                color: blue;
            }
            @import load/my111/styles2.css!async;
            @fetch load/my111/styles3.css!defer;
            .c {
                color: cologne;
            }
        }
        
        @fetch load/my111/styles222.css!async;
        @fetch load/my111/styles333.css!defer;
        
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
        
        @media on('myCustomEvent') {
            .baz {
                width: 23px;
            }
        }
        
        foo {
            color: back;
        }
        
        @media rel('preload') {
            @fetch load/my/styles2.css;
            @fetch load/my/styles3.css;
        }
        
        @media rel('preload') {
            .foo {
                color: blue;
            }    
        }

        @media rel('preload') {
            @fetch load/my/styles2.css;
            @fetch load/my/styles3.css;
            .foo {
                color: blue;
            }   
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
        result.should.be.have.length(21);

        // Test 1
        result[0].styles = result[0].styles.cs(); // remove "new-lines"
        assert.deepEqual(result[0], {
            attachOn: "load",
            imports: [],
            styles: ".foo { color: violette; } .foo .bar { color: gray; } .baz { color: serkan; }",
            type: "on",
        });

        // Test 2
        result[1].styles = result[1].styles.cs(); // remove "new-lines"
        assert.deepEqual(result[1], {
            attachOn: "load",
            imports: [],
            styles: ".laz .faz { height: 300px }",
            type: "on",
        });

        // Test 3
        result[2].styles = result[2].styles.cs(); // remove "new-lines"
        assert.deepEqual(result[2], {
            attachOn: "preload",
            imports: [],
            styles: ".laz .faz { display: flex }",
            type: "rel",
        });

        // Test 4
        result[3].styles = result[3].styles.cs(); // remove "new-lines"
        assert.deepEqual(result[3], {
            attachOn: "load",
            imports: [
                "load/my111/styles3.css!defer",
            ],
            styles: ".a { color: red; } .b { color: blue; } @import load/my111/styles2.css!async .c { color: cologne; }",
            type: "on",
        });

        // Test 5
        result[4].styles = result[4].styles.cs(); // remove "new-lines"
        assert.deepEqual(result[4], {
            attachOn: "immediately",
            imports: [
                "load/my111/styles222.css!async",
            ],
            styles: "",
            type: "default",
        });

        // Test 6
        result[5].styles = result[5].styles.cs(); // remove "new-lines"
        assert.deepEqual(result[5], {
            attachOn: "immediately",
            imports: [
                "load/my111/styles333.css!defer",
            ],
            styles: "",
            type: "default",
        });

        // Test 7
        result[6].styles = result[6].styles.cs(); // remove "new-lines"
        assert.deepEqual(result[6], {
            attachOn: "load",
            imports: [],
            // @Fixme: may be wrong due import need trailing semicolon, but postcss remove it ?!?
            // @update: this is according standard not allowd. Grammer should throw error
            styles: "@import load/my/styles1.css .nut { color: magento; }",
            type: "on",
        });

        // Test 8
        result[7].styles = result[7].styles.cs(); // remove "new-lines"
        assert.deepEqual(result[7], {
            attachOn: "print",
            imports: [],
            styles: ".a { color: yellow; } .a .b { color: b; } .a .c { color: c; }",
            type: "mediaMatch",
        });

        // Test 9
        result[8].styles = result[8].styles.cs(); // remove "new-lines"
        assert.deepEqual(result[8], {
            attachOn: "myCustomEvent",
            imports: [],
            styles: ".baz { width: 23px; }",
            type: "on",
        });

        // Test 10
        result[9].styles = result[9].styles.cs(); // remove "new-lines"
        assert.deepEqual(result[9], {
            attachOn: "preload",
            imports: [
                "load/my/styles2.css",
                "load/my/styles3.css",
            ],
            styles: "",
            type: "rel",
        });

        // Test 11
        result[10].styles = result[10].styles.cs(); // remove "new-lines"
        assert.deepEqual(result[10], {
            attachOn: "preload",
            imports: [],
            styles: ".foo { color: blue; }",
            type: "rel",
        });

        // Test 12
        result[11].styles = result[11].styles.cs(); // remove "new-lines"
        assert.deepEqual(result[11], {
            attachOn: "preload",
            imports: [
                "load/my/styles2.css",
                "load/my/styles3.css",
            ],
            styles: ".foo { color: blue; }",
            type: "rel",
        });

        // Test 13
        result[12].styles = result[12].styles.cs(); // remove "new-lines"
        assert.deepEqual(result[12], {
            attachOn: "(max-width: 360px)",
            imports: [
                "load/my/styles3.css",
            ],
            styles: "",
            type: "mediaMatch",
        });

        // Test 14
        result[13].styles = result[13].styles.cs(); // remove "new-lines"
        assert.deepEqual(result[13], {
            attachOn: "only screen and (min-device-width:320px) and (max-device-width:639px)",
            imports: [],
            // TODO: write styles into file for loading on match
            styles: ".lol { color: yellow; } .lol .b { color: b; } .lol .c { color: c; }",
            type: "mediaMatch",
        });

        // Test 15
        result[14].styles = result[14].styles.cs(); // remove "new-lines"
        assert.deepEqual(result[14], {
            attachOn: "immediately",
            imports: [],
            styles: ".foo { color: gray; }",
            type: "default",
        });

        // Test 16
        result[15].styles = result[15].styles.cs(); // remove "new-lines"
        assert.deepEqual(result[15], {
            attachOn: "immediately",
            imports: [],
            styles: ".laz { width: 300px; }",
            type: "default",
        });

        // Test 17
        result[16].styles = result[16].styles.cs(); // remove "new-lines"
        assert.deepEqual(result[16], {
            attachOn: "immediately",
            imports: [],
            styles: ".laz .faz { right: 6px; left: 3px; }",
            type: "default",
        });

        // Test 18
        result[17].styles = result[17].styles.cs(); // remove "new-lines"
        assert.deepEqual(result[17], {
            attachOn: "immediately",
            imports: [],
            styles: "foo { color: back; }",
            type: "default",
        });

        // Test 19
        result[18].styles = result[18].styles.cs(); // remove "new-lines"
        assert.deepEqual(result[18], {
            attachOn: "immediately",
            imports: [],
            styles: "#foo { color: pink; }",
            type: "default",
        });

        // Test 20
        result[19].styles = result[19].styles.cs(); // remove "new-lines"
        assert.deepEqual(result[19], {
            attachOn: "immediately",
            imports: [],
            styles: ".beforeImport { color: green; }",
            type: "default",
        });

        // Test 21
        result[20].styles = result[20].styles.cs(); // remove "new-lines"
        assert.deepEqual(result[20], {
            attachOn: "immediately",
            imports: [],
            styles: ".afterImport { color: red; }",
            type: "default",
        });
});

it.run();
