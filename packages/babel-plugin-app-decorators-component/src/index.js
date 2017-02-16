import { elements } from './elements';

/**
 * defaultOptions
 * @type {{
 *     customElements: boolean,
 *     independent   : boolean
 * }}
 */
let defaultOptions = {

    /**
     * possible values: false, "v0", "v1"
     * customElements {boolean|string}
     */
    customElements: false,

    /**
     * on true : @component (nothing changed)
     * on false: @component convert to
     * _component(options){
     *     ...code...
     *     depend on customElements = v0, v1
     *     ...code...
     * }
     * independent {boolean}
     */
    independent: true,

    /**
     * Safari´s and IE´s native Element-Class it not a function.
     * We have to map them to a function otherwise it throw an error.
     *
     * if (typeof HTMLElement === 'object'){
     *     let _Element = function(){};
     *     _Element.prototype = HTMLElement.prototype;
     *     HTMLElement = _Element;
     * }
     *
     * Foo extends HTMLElement {
     *     ..code..
     * }
     *
     */
    polypill: ['elementClassToFunction'],



};

/**
 * getDecorator
 * @param decoratorName
 * @returns {object|null}
 */
let getDecorator = function(decoratorName) {

    let decorators = this.decorators || [];

    for(let decorator of decorators){
        let { name } = decorator.expression.callee;
        if(decoratorName === name){
            return decorator;
        }
    }

    return null;
};

/**
 * getElementClassByName
 * @param name {string}
 * @param elements {object}
 * @returns {*|string}
 */
let getElementClassByName = function(name, elements) {

    let element = elements[name] || 'HTMLElement';
    return element;
};

/**
 * getArguments
 * @param t {object}
 * @returns {{extends: string}}
 */
let getArguments = function(t){

    // set default
    let args = {
        extends: 'div',
    };
    let [ firstArgument ] = this.expression.arguments;

    if(!t.isObjectExpression(firstArgument)){
        return args;
    }

    let { properties } = firstArgument;
    for(let property of properties){
        args[property.key.name] = property.value.value
    }

    return args;
};

/**
 * addSuperClass
 * @param element {string}
 * @param t {object}
 */
let addSuperClass = function(element, t) {

    let identifier = t.identifier(element);
    this.superClass = identifier;
};

/**
 * addStaticGetterProperty
 * @param type {string}
 * @param superClass {string}
 * @param t {object}
 */
let addStaticGetterProperty = function(type, superClass, t) {

    let classMethodNode = t.classMethod(
        'get',
        t.identifier(type),
        [],
        t.blockStatement([
            t.returnStatement(t.stringLiteral(superClass))
        ]),
        false,
        true
    );

    this.body.body.push(classMethodNode);
};

/**
 * plugin
 * @astexplorer: https://astexplorer.net (useful for building plugin)
 * @param t {types}
 * @returns {{visitor: {ClassDeclaration: (function(*=))}}}
 */
let plugin = ({types: t}) => {

    return {
        visitor: {

            /**
             * ClassDeclaration
             * @param node {object}
             * @param opts {object}
             */
            ClassDeclaration({ node } = path, { opts } = state) {

                let options = Object.assign({}, defaultOptions, opts);

                let component = node::getDecorator('component');
                if(!component){

                    /**
                     * If no @component but HTML... as superClass
                     * and no extends() then add addStaticGetterProperty
                     */
                    return;
                }

                let superClass = component::getArguments(t).extends;

                let element = getElementClassByName(superClass, elements);
                node::addSuperClass(element, t);

                if(/div/.test(superClass)){
                    return;
                }

                node::addStaticGetterProperty('extends', superClass, t);
            },
        },
    };
};

export default plugin;
