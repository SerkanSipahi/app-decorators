
import { queryString } from 'src/helpers/queryString';


describe('queryString', () => {

    describe('parse method', () => {

        it('query strings starting with a `?`', () => {
            should(queryString.parse('?foo=bar')).be.containEql({foo: 'bar'});
        });

        it('query strings starting with a `&`', () => {
            should(queryString.parse('#foo=bar')).be.containEql({foo: 'bar'});
        });

        it('query strings starting with a `&`', () => {
            should(queryString.parse('&foo=bar&foo=baz')).be.containEql({foo: ['bar', 'baz']});
        });

        it('parse a query string', () => {
            should(queryString.parse('foo=bar')).be.containEql({foo: 'bar'});
        });

        it('parse multiple query string', () => {
            should(queryString.parse('foo=bar&key=val')).be.containEql({
                foo: 'bar',
                key: 'val'
            });
        });

        it('parse query string without a value', () => {
            should(queryString.parse('foo')).be.containEql({foo: null});

            should(queryString.parse('foo&key')).be.containEql({
                foo: null,
                key: null
            });

            should(queryString.parse('foo=bar&key')).be.containEql({
                foo: 'bar',
                key: null
            });

            should(queryString.parse('a&a=')).be.containEql({a: [null, null]});
        });

        it('return empty object if no qss can be found', () => {
            should(queryString.parse('?')).be.containEql({});
            should(queryString.parse('&')).be.containEql({});
            should(queryString.parse('#')).be.containEql({});
            should(queryString.parse('') ).be.containEql({});
            should(queryString.parse(' ')).be.containEql({});
        });

        it('handle `+` correctly', () => {
            should(queryString.parse('foo+faz=bar+baz++')).be.containEql({'foo faz': 'bar baz  '});
        });

        it('handle multiple of the same key', () => {
            should(queryString.parse('foo=bar&foo=baz')).be.containEql({foo: ['bar', 'baz']});
        });

        it('handle multiple of the same key', () => {
            should(queryString.parse('foo=bar&foo=baz')).be.containEql({foo: ['bar', 'baz']});
        });

        it('query strings params including embedded `=`', () => {
            should(queryString.parse('?param=http%3A%2F%2Fsomeurl%3Fid%3D2837')).be.containEql({
                param: 'http://someurl?id=2837'
            });
        });

        it('query strings params including raw `=`', () => {
            should(queryString.parse('?param=http://someurl?id=2837')).be.containEql({
                param: 'http://someurl?id=2837'
            });
        });

        it('object properties', () => {
            should(queryString.parse('hasOwnProperty=foo')).be.containEql({hasOwnProperty: 'foo'});
        });

    });

});

