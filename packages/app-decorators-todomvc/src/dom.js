import { Eventhandler } from 'app-decorators';
import { forEach } from './utils';

let _getNodeList = (value) => {
    return value.forEach ? value : [ value ];
};

let hasClass = function(cls) {

    this.classList.contains(cls);
    return this;
};

let addClass = function(cls) {

    let nodeList = _getNodeList(this);
    nodeList::forEach(el => el.classList.add(cls));

    return this;
};

let removeClass = function(cls) {

    let nodeList = _getNodeList(this);
    nodeList::forEach(el => el.classList.remove(cls));

    return this;
};

let toggleClass = function(cls) {

    let nodeList = _getNodeList(this);
    nodeList::forEach(el => el.classList.toggle(cls));

    return this;
};

let append = function(node){

    this.appendChild(node);
    return this;
};

let remove = function() {

    this.parentElement.removeChild(this);
};

let show = function(){

    let nodeList = _getNodeList(this);
    nodeList::forEach(el => el.style.display = 'block');

    return this;
};

let hide = function(){

    let nodeList = _getNodeList(this);
    nodeList::forEach(el => el.style.display = 'none');

    return this;
};

let text = function(text){

    let nodeList = _getNodeList(this);
    nodeList::forEach(el => el.textContent = text);

    return this;
};

let attribute = function(key, value){

    if(key && value){
        this.setAttribute(key, value);
        return this;
    } else if(key && !value){
        return this.getAttribute(key);
    }
};

let find = function(selector){
    return this.querySelector(selector);
};

let findAll = function(selector){
    return this.querySelectorAll(selector);
};

let parent = function(){
    return this.parentElement;
};

let click = function(){

    this.click();
    return this;

};

let addListener = function(eventName, callback){

    let listener = Eventhandler.create({
        element: this,
    });

    listener.on(eventName, callback);

    return this;

};

let $ = function(query) {
    return document.querySelectorAll(query)
};

export {
    hasClass,
    addClass,
    removeClass,
    toggleClass,
    append,
    remove,
    show,
    hide,
    text,
    attribute,
    find,
    findAll,
    parent,
    click,
    addListener,
};