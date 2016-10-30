
import { component, view } from 'src/app-decorators';

@component()
@view(`<div class="{{name}}">{{content}}</div>`, { renderedFlag: false })
export default class Test {

	@view.bind name;
	@view.bind content;

}
