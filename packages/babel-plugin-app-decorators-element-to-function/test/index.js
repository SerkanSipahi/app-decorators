import { it } from 'app-decorators-simple-it';
import { transform } from 'babel-core';
import appDecoratorElementToFunc from '../src/index';
import 'should';

let clean = value => value.replace(/[\r\n ]+/g, '').trim();

let transformCode = code => {

    let generated = transform(code, {
        plugins: [
            appDecoratorElementToFunc,
        ]
    });

    return generated.code;
};

it('should modify nothing when no superClass found', () => {

    let actual =`class Foo {}`;
    clean(transformCode(actual)).should.be.equal(clean(actual));

});

it('should modify nothing when superClass is not an HTML Element', () => {

    let actual =`class Foo extends Bar {}`;
    clean(transformCode(actual)).should.be.equal(clean(actual));

});

it('should modify superClass when its an HTML Element and add import statement (1)', () => {

    let actual =`class Foo extends HTMLElement {}`;
    let expected =`
    import _elementToFunc from "app-decorators/src/libs/element-to-function";
    class Foo extends _elementToFunc(HTMLElement) {}`;

    clean(transformCode(actual)).should.be.equal(clean(expected));

});

it('should modify superClass when its an HTML Element and add import statement (2)', () => {

    let actual =`
    import x from 'x';
    class Foo extends HTMLElement {}`;

    let expected =`
    import _elementToFunc from 'app-decorators/src/libs/element-to-function';
    
    import x from 'x';
    class Foo extends _elementToFunc(HTMLElement) {}`;

    clean(transformCode(actual)).should.be.equal(clean(expected));

});

it.run();
