import assert from 'assert-diff';
import { parse } from'./index';
import { it } from './simple-it';
import 'should';

let stylesFixture = `
@on('load') {
    .foo {
        color: violette;
    }
}

@on('load') {
    @import "load/my/styles1.css";
    .nut {
        color: magento;
    }
}
@on('load') {
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
}
@media print {
    .a {
        color: yellow
    }
}

@rel('preload') {
    .foo {
        color: blue;
    }
}
@rel('preload') {
	@fetch load/my/styles2.css!async;
	@fetch load/my/styles3.css!defer;
}

@on('myCustomEvent') {
    .baz {
        width: 23px;
    }
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
        '} \n';
    let barClass =
        '#foo {'+
        'color: gray;'+
        '} \n' ;
    let bazClass =
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
