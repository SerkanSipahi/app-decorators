import { it } from './simple-it';
import { transform } from 'babel-core';
import syntaxDecorator from 'babel-plugin-syntax-decorators';
import syntaxFuncBind from 'babel-plugin-syntax-function-bind';
import appDecoratorStylePrecompiler from '../lib/index';

import 'should';

let clean = value => value.replace(/[\r\n ]+/g, '').trim();

function transformCode(code, options = {}){

    let generated = transform(code, {
        plugins: [
            [appDecoratorStylePrecompiler, options],
            syntaxDecorator,
            syntaxFuncBind
        ]
    });
    return generated.code;
}

it('should throw error when String/Template -Literal concatenated by binary expression', () => {

    let actualStringLiteral =`
            @style(".foo { background-color: " + "red;")
            class Foo {}`;

    let actualTemplateLiteral =`
            @style(\`.foo { background-color: \` + \`red;\`)
            class Foo {}`;

    (() => { transformCode(actualStringLiteral) }).should.throw();
    (() => { transformCode(actualTemplateLiteral) }).should.throw();
});

it('should not throw error when using interpolation vars', () => {

    let actual =`
    let x = 'red';
    @style(\`.color: \${x};\`)
    class Foo {}`;

    (() => { transformCode(actual) }).should.not.throw();
});

it('should not throw error when other decorator', () => {

    let actual =`
    @xzy(\`.color: red;\`)
    class Foo {}`;

    let expected =`
    @xzy(\`.color: red;\`)
    class Foo {}`;

    clean(transformCode(actual)).should.be.equal(clean(expected));
});

it('should compile style literal to object literal', () => {

    let actual =`
    @style(\`
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
        
        @fetch to/my/critical/path/file3.css;
        
    \`)
    class Foo {}`;

    let expected =`
    @style([
        {
            attachOn:"immediately",
            imports:[
                "to/my/critical/path/file3.css"
            ],
            styles:\`
                .foo {
                    background-color:red;
                }
                .bar {
                    background-color:red;
                }\`,
            type:"default"
        },
        {
            attachOn:"load",
            imports:[
                "to/my/src/file.css",
                "to/my/src/file2.css"
            ],
            styles:"",
            type:"on"
        }
    ])
    class Foo {}`;

    clean(transformCode(actual)).should.be.equal(clean(expected));

});

it.skip('should minify css', () => {

});

it.skip('should autoprefix css', () => {

});

it.run();
