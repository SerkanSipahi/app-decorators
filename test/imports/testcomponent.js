
import { component, view } from 'src/app-decorators';

@view(`<div class="{{name}}">{{content}}</div>`, { renderedFlag: false })
@component()
export default class Test {

	@view.bind name;
	@view.bind content;

}
