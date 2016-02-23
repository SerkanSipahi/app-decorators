
import { component, view } from 'src/app-decorators';

@view(`<div class="{{name}}">{{content}}</div>`)
@component()
export default class Test {

	@view.bind name;
	@view.bind content;

}
