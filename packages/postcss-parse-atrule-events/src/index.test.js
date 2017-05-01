import assert from 'assert-diff';
import { parse } from'./index';
import { it } from './simple-it';
import 'should';

let stylesFixture = `
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

@media on('load') {
    @import "load/my/styles1.css";
    .nut {
        color: magento;
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
    /*@fetch   <= when no path declared*/
    /*
    .serkan {
        @fetch load/my/styles3.css!defer;
    }
    */
    c. {
        color: cologne;
    }
}
/**
 * Should not be removed, should be included in "immediately"
 */ 
@media print {
    .a {
        color: yellow;
        .b {
            color: b;
            .c {
                color: c;
            }
        }
    }
}

@media rel('preload') {
    .foo {
        color: blue;
    }
}
@media rel('preload') {
	@fetch load/my/styles2.css!async;
	@fetch load/my/styles3.css!defer;
}

@media on('myCustomEvent') {
    .baz {
        width: 23px;
    }
}

#serkan {
    background-color: liya;
}

`;

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

it.run();
