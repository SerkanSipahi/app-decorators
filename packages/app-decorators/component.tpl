import { action, component, on, view } from "app-decorators";

@view(`
    <div class="foo">Click Foo</div>
    <a href="/some/path.html">Click Link A</a>
    <a href="?a=b&c=d">Click Link B</a>
    <a href="#hey=ho">Click Link C</a>
`)
@component()
class {{name}} {

    created(vars) {
        console.log('created', this, vars)
    }

    attached() {
        console.log('attached', this);
    }

    @on('click .foo') onClickFoo(ev) {
        console.log('clicked foo', ev);
    }

    @action('/some/path.html') actionA({params, search, hash}) {
        console.log(event, params, search, hash);
    }

    @action('?a={{value}}') actionB({params, search, hash}) {
        console.log(params, search);
    }

    @action('#hey={{value}}') actionC({params, hash}) {
        console.log(params, hash);
    }
}

export {
    {{name}}
}