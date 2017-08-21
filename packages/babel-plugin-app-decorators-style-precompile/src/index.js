import * as t from "babel-types";
import template from 'babel-template';
import { parse } from 'postcss-parse-atrule-events';

/**
 * getDecorator
 * @param decoratorName {string}
 * @returns {*}
 */
let getDecorator = function(decoratorName) {

    if(!this.node.decorators){
        return [];
    }

    return this.node.decorators.filter(deco => {
        let { name } = deco.expression.callee;
        if(name === decoratorName){
            return true;
        }
    });
};

/**
 * getStyle
 * @returns {{style: null}}
 */
let getStyle = function(){

    let statement = { style: null, error: null };

    let args = this.expression.arguments;
    if(!args.length) {
        return statement;
    }
    if(t.isStringLiteral(args[0])){
        let [{ value }] = args;
        statement.style = value;
    } else if(t.isTemplateLiteral(args[0])){
        let [{ quasis: [{ value: { raw } }] }] = args;
        statement.style = raw;
    } else if(t.isArrayExpression(args[0])) {
        statement.style = args[0];
    } else {
        statement.error = `
        Please use StringLiteral ("foo") or TemplateLiteral (\`bar\`). Do not use
        something like this: "hello" + "World".`;
    }

    return statement;
};

let getOptions = function(){

    let args = this.expression.arguments;
    if(!args.length) {
        return {};
    }
    if(t.isObjectExpression(args[1])){
        return args[1];
    }

    return {};
};

/**
 * precompile
 * @params {string}
 * @params {object}
 * @returns {Array}
 */
let precompile = (style, opts = {}) => parse(style, Object.assign({ optimize: true }, opts));

/**
 * @param collection {array}
 * @returns {string}
 */
let arrayToString = collection => {
    let importsTpl = "";
    for(let imp of collection) importsTpl += `"${imp}", `;
    return importsTpl;
};

/**
 * createAst
 * @this-param {string}
 * @param vars {object}
 * @returns {object}
 */
let createAst = function(vars = {}){

    let styleTemplate = "";
    for(let styleObj of this){
        let {attachOn, imports, styles, type, option} = styleObj;
        styleTemplate += `{
            attachOn: "${attachOn}",
            imports: [${arrayToString(imports)}],
            styles: ${styles && styles.length ? "`"+styles+"`" : '"'+styles+'"'},
            type: "${type}",
            ${(option) ? "option: ["+arrayToString(option || [])+"]" : ""}
        },`;
    }
    return template(`[${styleTemplate}]`)();
};

function plugin () {

    return {
        visitor: {
            ClassDeclaration(path, { opts }){

                let [ component ] = path::getDecorator('style');
                if(!component){
                    return;
                }

                let { style, error } = component::getStyle();
                if (error) {
                    throw new Error(error);
                }

                if(typeof style !== "string"){
                    return;
                }

                let options = component::getOptions(); // should be createOptAst
                let precompiled = template::precompile(style/*, options*/);
                let ast = precompiled::createAst();
                component.expression.arguments.splice(0, 1, ast.expression);
            }
        }
    };
}

export default plugin;