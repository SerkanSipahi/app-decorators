import assert from 'assert';
import { parse } from'./index';
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

.huhu {
    .la {
        color: green;
    }
}

.qaz {
    color: gray;
    .lux {
        color: red;
    }
}

.aaa {
    color: xing;
    .lux {
        color: pink;
    }
}

.bbb {
    color: linkedin;
    .lux {
        color: google;
    }
}
`;

assert.ok('a'.should.be.equal('a'), 'Hello World');
