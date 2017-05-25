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

it('stream css', () => {

    /**
     * Very useful if you want to apply your css while downloading
     * and not applying after its downloaded!
     */

    let styles1 =
        `@stream load/my/styles3.css;`;

    let styles2 =
        `@media (max-width: 360px) {
            @stream load/my/styles3.css;
        }`;
});

it('integration test', () => {

    let styles =
        `.foo {
            color: gray;
        }
        #foo {
            color: pink;
        }
        foo {
            color: back
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
            @fetch load/my111/styles2.css!async;
            @fetch load/my111/styles3.css!defer;
            .c {
                color: cologne;
            }
        }
        
        @fetch load/my111/styles222.css!async;
        @fetch load/my111/styles333.css!defer;
        
        @media on('load') {
            @import "load/my/styles1.css";
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
        
        @media rel('preload') {
            @fetch load/my/styles2.css;
            @fetch load/my/styles3.css;
        }
        
        @media rel('preload') {
            .foo {
                color: blue;
            }    
        }

        @media (max-width: 360px) {
            @fetch load/my/styles3.css;
        }

        @media (max-width: 768px) {
            @fetch load/my/styles3.css;
        }
        
        @media (max-width: 1300px) {
            .lol {
                color: yellow;
                .b {
                    color: b;
                }
                .c {
                    color: c;
                }
            }
        }`;

        let result = parse(styles);
        //console.log(result);


        // test also the right order

});

it.run();
