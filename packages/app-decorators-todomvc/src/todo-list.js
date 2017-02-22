import { component, on } from 'app-decorators';
import { TodoItem } from './todo-item';
import { forEach, trigger } from './utils';
import { append, removeClass, addClass, find, click, toggleClass, findAll } from './dom';

@component({
    name: 'todo-list',
    extends: 'ul',
})
class TodoList {

    /**
     * Events
     */

    @on('new-item') onNewItem({ params }){

        let todoItem = TodoItem.create({ text: params });
        this::append(todoItem);

        this.update();

    }

    @on('complete [is="todo-item"]') onComplete({ target }){

        target.complete();
        this.update();

    }

    @on('delete [is="todo-item"]') onDelete({ target }){

        target.remove();
        this.update();

    }

    /**
     * Public methods
     */

    clear(){

        this.querySelectorAll('li')::forEach(
            element => element.remove()
        );

        this._triggerCounts({
            count: 0, left: 0, completed: 0
        });

    }

    update(){

        let count     = this._getAllCount();
        let left      = this._getLeftCount();
        let completed = this._getCompleteCount();

        this._triggerCounts({
            count, left, completed
        });
    }

    count(type){

        switch(type) {
            case 'all':
                return this._getAllCount();
            break;
            case 'left':
                return this._getLeftCount();
            break;
            case 'complete':
                return this._getCompleteCount();
            break;
        }

    }

    filter(type){

        let $ = ::this.querySelectorAll;

        switch(type) {
            case 'all':
                this._applyFilterAll($);
            break;
            case 'active':
                this._applyFilterActive($);
            break;
            case 'completed':
                this._applyFilterCompleted($);
            break;
        }

    }

    toggle(){

        let maxCount      = this.count('all');
        let completeCount = this.count('complete');

        if(completeCount > 0 && completeCount < maxCount){
            this::findAll('li:not(.completed)')::forEach(
                el => el::find('input')::click()::addClass('completed')
            );
        } else {
            this::findAll('li')::forEach(
                el => el::find('input')::click()::toggleClass('completed')
            );
        }

    }

    /**
     * Private methods
     */

    _triggerCounts(params){

        this::trigger('count', params);

    }

    _applyFilterAll($){

        $('ul[is="todo-list"] li')::removeClass('hidden');
    }

    _applyFilterActive($){

        $('ul[is="todo-list"] li')::removeClass('hidden');
        $('ul[is="todo-list"] li.completed')::addClass('hidden');
    }

    _applyFilterCompleted($){

        $('ul[is="todo-list"] li')::removeClass('hidden');
        $('ul[is="todo-list"] li:not(.completed)')::addClass('hidden');
    }

    _getAllCount(){

        return this.querySelectorAll('li').length;

    }

    _getLeftCount(){

        return this.querySelectorAll('li:not(.completed)').length;

    }

    _getCompleteCount(){

        return this.querySelectorAll('li.completed').length;

    }

}

export {
    TodoList
}