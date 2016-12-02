import { component, view } from 'app-decorators';

@view(`<div class="{{name}}">{{content}}</div>`, { renderedFlag: false })
@component()
class Test {

	@view.bind name;
	@view.bind content;

}

export {
	Test
}
