
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

    describe('stringify method', () => {
        
        it('stringify', () => {
            queryString.stringify({foo: 'bar'}).should.be.equal('foo=bar');
            queryString.stringify({foo: 'bar', 'bar': 'baz'}).should.be.equal('foo=bar&bar=baz');
        });


        it('different types', () => {
            queryString.stringify('').should.be.equal('');
            queryString.stringify(0).should.be.equal('');
            queryString.stringify(1).should.be.equal('');
            queryString.stringify([]).should.be.equal('');
            queryString.stringify(true).should.be.equal('');
        });

        it('URI encode', () => {
            queryString.stringify({'foo bar': 'baz faz'}).should.be.equal('foo%20bar=baz%20faz');
            queryString.stringify({'foo bar': 'baz\'faz'}).should.be.equal('foo%20bar=baz%27faz');
        });

        it('no encoding', () => {
            queryString.stringify({'foo:bar': 'baz:faz'}, false).should.be.equal('foo:bar=baz:faz');
        });

        it('handle array value', () => {
            queryString.stringify({
                abc: 'abc',
                foo: ['bar', 'baz']
            }).should.be.equal('abc=abc&foo=bar&foo=baz');
        });

        it('handle empty array value', () => {
            queryString.stringify({
                abc: 'abc',
                foo: []
            }).should.be.equal('abc=abc');
        });

        it.skip('should not encode undefined values', () => {
            queryString.stringify({
                abc: undefined,
                foo: 'baz'
            }).should.be.equal('foo=baz');
        });

        it('should encode null values as just a key', () => {
            queryString.stringify({
                'x y z': null,
                'abc': null,
                'foo': 'baz'
            }).should.be.equal('x%20y%20z&abc&foo=baz');
        });

        it('handle null values in array', () => {
            queryString.stringify({
                foo: null,
                bar: [null, 'baz']
            }).should.be.equal('foo&bar&bar=baz');
        });

        it('handle undefined values in array', () => {
            queryString.stringify({
                foo: null,
                bar: [undefined, 'baz']
            }).should.be.equal('foo&bar=baz');
        });

        it('handle undefined and null values in array', () => {
            queryString.stringify({
                foo: null,
                bar: [undefined, null, 'baz']
            }).should.be.equal('foo&bar&bar=baz');
        });

        it('strict encoding', () => {
            queryString.stringify({foo: '\'bar\''}).should.be.equal('foo=%27bar%27');
            queryString.stringify({foo: ['\'bar\'', '!baz']}).should.be.equal('foo=%27bar%27&foo=!baz');
        });

        it.skip('loose encoding', () => {
            queryString.stringify({foo: '\'bar\''}).should.be.equal('foo=\'bar\'');
            queryString.stringify({foo: ['\'bar\'', '!baz']}).should.be.equal('foo=\'bar\'');
        });

    });

});

