import { component, on } from 'app-decorators';
import { trigger } from './utils';
import { attribute } from './dom';

@component({
    name: 'todo-new',
    extends: 'input',
})
class TodoNew {

    @on('keypress') onKeypress({ keyCode }){

        if (keyCode !== 13 || this.value === ''){
            return;
        }

        let selector = this::attribute('target');
        let scope    = document.querySelector(selector);
        scope::trigger('new-item', this.value);

        this.value = '';

    }

}

export {
    TodoNew
}