import { elements } from './elements';

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
 * add static string property
 * @param prop {string}
 * @param value {string}
 * @param t {object}
 */
let addStaticStringProperty = function(prop, value, t) {

    let a = t.classProperty(
        t.identifier(prop),
        t.stringLiteral(value)
    );
    a.static = true;
    this.body.body.push(a);
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
 * getProgram
 * @param node
 * @returns {*}
 */
let getProgram = node => {
    while(node.parent){
        node = node.findParent(node => node);
        if(node.key === "program"){
            return node;
        }
    }
};

/**
 * plugin
 * @astexplorer: https://astexplorer.net (useful for building plugin)
 * @param t {types}
 * @returns {{visitor: {ClassDeclaration: (function(*=))}}}
 */
let plugin = ({types: t}) => {

    return {
        pre(){
            this.cache = new Map();
        },
        post(){
            this.cache.clear();
        },
        visitor: {
            Program(path, { opts } = state) {

                // shim elementToFunction
                if(!opts.elementToFunc){
                    return;
                }

                let programBody = path.node.body;
                let importSrcPath = "app-decorators/src/libs/element-to-function";

                // return when import for elementToFunc already exists
                for(let node of programBody) {
                    if(node.type !== "ImportDeclaration") continue;
                    if(node.source.value === importSrcPath) return;
                }

                let name = this.cache.get("elementToFunc");
                if(!name){
                    name = path.scope.generateUidIdentifier("elementToFunc").name;
                    this.cache.set("elementToFunc", name);
                }

                // create import statement for elementToFunc
                let importDeclaration = t.importDeclaration(
                    [t.importDefaultSpecifier(t.identifier(name))],
                    t.stringLiteral(importSrcPath)
                );

                // add import statement for elementToFunc
                programBody.unshift(importDeclaration);

            },
            /**
             * ClassDeclaration
             * @param node {object}
             * @param opts {object}
             */
            ClassDeclaration(path, { opts } = state) {

                let options = opts || {};
                let { node } = path;

                let component = node::getDecorator('component');
                if(!component){

                    /**
                     * If no @component but HTML... as superClass
                     * and no extends() then add addStaticGetterProperty
                     */
                    return;
                }

                let className = node.id.name;
                node::addStaticStringProperty('$$componentName', className, t);

                let superClass = component::getArguments(t).extends;
                let element = getElementClassByName(superClass, elements);
                node::addSuperClass(element, t);

                if(!/div/.test(superClass)){
                    node::addStaticGetterProperty('extends', superClass, t);
                }

                // shim elementToFunction
                if(!options.elementToFunc){
                    return;
                }

                /**
                 * Begin for elementToFunc shim
                 */

                // replace extends identifier with "elementToFunc"
                let name = this.cache.get("elementToFunc");

                let callExpressionNode = t.callExpression(t.identifier(name), [t.identifier(element)]);
                path.node.superClass = callExpressionNode;

            },
        },
    };
};

export default plugin;
