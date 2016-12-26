import $ from 'jquery';
import { delay } from './delay';

$.fn.clickAndWait = function(ms) {
    this.get(0).click();
    return delay(ms);
};