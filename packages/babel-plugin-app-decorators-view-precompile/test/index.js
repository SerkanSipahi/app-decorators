import { transform } from 'babel-core';
import syntaxDecorator from 'babel-plugin-syntax-decorators';
import syntaxFuncBind from 'babel-plugin-syntax-function-bind';
import appDecoratorViewPrecompiler from'../src/index';
import 'should';

function trim(str) {
    return str.replace(/^\s+/gm, '');
}

const defaultCompilerOptions = {
    "engine": "handlebars"
};

function transformCode(code, options = defaultCompilerOptions){

    let generated = transform(code, {
        plugins: [
            [appDecoratorViewPrecompiler, options],
            syntaxDecorator,
            syntaxFuncBind
        ]
    });
    return generated.code;
}

describe('@view', () => {

    it('should throw error when String/Template -Literal concatenated by binary expression', () => {

        let actualStringLiteral =`
            @view("hello" + "world")
            class Foo {}`;

        let actualTemplateLiteral =`
            @view(\`hello\` + \`world\`)
            class Foo {}`;

        (() => { transformCode(actualStringLiteral) }).should.throw();
        (() => { transformCode(actualTemplateLiteral) }).should.throw();
    });

    it('should not throw error when using interpolation vars', () => {

        let actual =`
            let x = 'foo';
            @view(\`Hello \${x} World\`)
            class Foo {}`;

        (() => { transformCode(actual) }).should.not.throw();
    });


    it('should do nothing when no template passed', () => {

        let actual =`
            @view()
            class Foo {}`;

        let expected = `
            @view()
            class Foo {}`;

        trim(transformCode(actual)).should.be.equal(trim(expected));
    });

    it('should not precompile when "StringLiteral" passed without template vars', () => {

        let actual =`
            @view("Hello World")
            class Foo {}`;

        let expected = `
            @view("Hello World")
            class Foo {}`;

        trim(transformCode(actual)).should.be.equal(trim(expected));
    });

    it('should not precompile when "TemplateLiteral" passed without template vars', () => {

        let actual =`
            @view(\`Hello World\`)
            class Foo {}`;

        let expected = `
            @view(\`Hello World\`)
            class Foo {}`;

        trim(transformCode(actual)).should.be.equal(trim(expected));

    });

    it('should precompile when "StringLiteral" passed with template vars', () => {

        let actual =`
            @view("Hello {{item}}")
            class Foo {}`;

        let expected = `
            @view({
                "compiler": [7, ">= 4.0.0"],
                "main": function (container, depth0, helpers, partials, data) {
                    var helper;
                    return "Hello " + container.escapeExpression((helper = (helper = helpers.item || (depth0 != null ? depth0.item : depth0)) != null ? helper : helpers.helperMissing, typeof helper === "function" ? helper.call(depth0 != null ? depth0 : container.nullContext || {}, {
                        "name": "item",
                        "hash": {},
                        "data": data
                    }) : helper));
                },
                "useData": true
            })
            class Foo {}`;

        trim(transformCode(actual)).should.be.equal(trim(expected));

    });

    it('should precompile when "StringLiteral" passed with template vars', () => {

        let actual =`
            @view(\`Hello {{item}}\`)
            class Foo {}`;

        let expected = `
            @view({
                "compiler": [7, ">= 4.0.0"],
                "main": function (container, depth0, helpers, partials, data) {
                    var helper;
                    return "Hello " + container.escapeExpression((helper = (helper = helpers.item || (depth0 != null ? depth0.item : depth0)) != null ? helper : helpers.helperMissing, typeof helper === "function" ? helper.call(depth0 != null ? depth0 : container.nullContext || {}, {
                        "name": "item",
                        "hash": {},
                        "data": data
                    }) : helper));
                },
                "useData": true
            })
            class Foo {}`;

        trim(transformCode(actual)).should.be.equal(trim(expected));

    });

});
