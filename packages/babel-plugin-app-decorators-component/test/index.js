import assert from 'assert';
import { transform } from 'babel-core';
import appDecoratorComponent from'../src/index';
import syntaxDecorator from 'babel-plugin-syntax-decorators';

function trim(str) {
    return str.replace(/^\s+|\s+/gm, '');
}

function transformCode(code, options = {}){

    // transform code
    let generated = transform(code, {
        plugins: [
            [appDecoratorComponent, options],
            syntaxDecorator
        ]

    });

    return generated;
}

describe('@component', () => {

    it('should add class extends HTMLElement when no options passed', () => {

        let actual =`
            @component()
            class Foo {
            }`;

        let expected = `
            @component()
            class Foo extends HTMLDivElement {
                static $$componentName = "Foo";
            }`;

        let generated = transformCode(actual);

        assert.equal(trim(generated.code), trim(expected));

    });

    it('should add "class extends HTML{type}" when options passed', () => {

        let actual =`
            @component({
               extends: 'img'
            })
            class Foo {
            }`;

        let expected =`
            @component({
               extends: 'img'
            })
            class Foo extends HTMLImageElement {
                static $$componentName = 'Foo';
                static get extends() {
                    return 'img';
            }}`;

        let generated = transformCode(actual);
        assert.equal(trim(generated.code), trim(expected));

    });

    it('should add "class extends HTML{type}" by mixed classes', () => {

        let actual =`
            class Foo {}

            @component({
               extends: 'progress'
            })
            class Bar {
            }

            class Baz {}`;

        let expected =`
            class Foo {}

            @component({
               extends: 'progress'
            })
            class Bar extends HTMLProgressElement {
                static $$componentName = 'Bar';
                static get extends() {
                    return 'progress';
            }}

            class Baz {}`;

        let generated = transformCode(actual);
        assert.equal(trim(generated.code), trim(expected));

    });

    it('should wrap element with _elementToFunc when its set by option', () => {

        let actual =`
            class Foo {}
            @component({
               extends: 'progress'
            })
            class Bar {
            }
            class Baz {}`;

        let expected =`
            import _elementToFunc from 'app-decorators/src/libs/element-to-function';
            class Foo {}
            @component({
               extends: 'progress'
            })
            class Bar extends _elementToFunc(HTMLProgressElement) {
               static $$componentName = 'Bar';
               static get extends() {
                  return 'progress';
               }
            
            }
            class Baz {}`;

        let generated = transformCode(actual, { elementToFunc: true });
        assert.equal(trim(generated.code), trim(expected));

    });

    it.skip('should add static get extends() if HTML{type}Element already defined', () => {

        let actual =`
            class Bar extends HTMLImageElement {
            }`;

        let expected =`
            class Bar extends HTMLImageElement {
                static get extends() {
                    return 'img';
            }}`;

        let generated = transformCode(actual);
        assert.equal(trim(generated.code), trim(expected));

    });

    it.skip('should add HTML{type}Element if decorators already exists', () => {

        let actual =`
            @component({
               extends: 'img'
            })
            class Bar extends HTMLImageElement {
            }`;

        let expected =`
            @component({
               extends: 'img'
            })
            class Bar extends HTMLImageElement {
                static get extends() {
                    return 'img';
            }}`;

        let generated = transformCode(actual);
        assert.equal(trim(generated.code), trim(expected));

    });

    it.skip('should resolve passed "x" identifier', () => {

        let actual =`
            let x = 'img';
            @component({
               extends: x
            })
            class Bar {
            }`;

        let expected =`
            let x = 'img';
            @component({
               extends: x
            })
            class Bar extends HTMLImageElement {
                static get extends() {
                    return 'img';
            }}`;

        let generated = transformCode(actual);
        assert.equal(trim(generated.code), trim(expected));

    });

    it.skip('should resolve passed "x" identifier', () => {

        let actual =`
            let x = {
                extends: 'form'
            };
            @component(x)
            class Bar {
            }`;

        let expected =`
            let x = {
                extends: 'form'
            };
            @component(x)
            class Bar extends HTMLFormElement {
                static get extends() {
                    return 'form';
            }}`;

        let generated = transformCode(actual);
        assert.equal(trim(generated.code), trim(expected));

    });

    it.skip('should resolve class', () => {

        let actual =`
            class Bar {}

            @component()
            class Foo extends Bar {
            
            }`;

        let expected =`
            class Bar extends HTMLElement {}

            @component()
            class Foo extends Bar {
            
            }`;

        let generated = transformCode(actual);
        assert.equal(trim(generated.code), trim(expected));

    });

});
