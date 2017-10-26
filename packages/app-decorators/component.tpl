import { action, component, on, view, style } from "app-decorators";

@style(`
    @on load {
        @fetch foo.css;
    }
    @on click .bar {
        @fetch bar.css;
    }
    @action /some/path.html {
        @fetch baz.css;
    }
    .critical-path-css {
        width: 100px;
        height: 100px;
    }
`)
@view(`
    <div class="critical-path-css">
        <div class="foo">On load Foo</div>
        <div class="bar">Click Bar</div>
        <a href="/some/path.html">Click Link A</a>
        <a href="?a=b&c=d">Click Link B</a>
        <a href="#hey=ho">Click Link C</a>
    </div>
`)
@component()
class {{name}} {

    created(vars) {
        console.log('created', this, vars)
    }

    attached() {
        console.log('attached', this);
    }

    @on('click .bar') onClickFoo(ev) {
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