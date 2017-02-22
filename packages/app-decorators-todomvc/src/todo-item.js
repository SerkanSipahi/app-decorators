import { component, view, on } from 'app-decorators';
import { remove, toggleClass } from './dom';
import { trigger } from './utils';

@view(`
    <div class="view">
        <input class="toggle" type="checkbox">
        <label>{{ text }}</label>
        <button class="destroy"></button>
    </div>
    <input class="edit" value="abc">
`)
@component({
    name: 'todo-item',
    extends: 'li',
})
class TodoItem {

    @on('change li input[type="checkbox"]') onCompleted(){

        this::trigger('complete');

    }

    @on('click li button.destroy') onDeleted(){

        this::trigger('delete');

    }

    complete(){

        this::toggleClass('completed');

    }

    remove() {

        this::remove();

    }

}

export {
    TodoItem
}
