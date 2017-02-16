import * as t from "babel-types";
import template from 'babel-template';
import handlebars from 'handlebars';

let engines = {
    handlebars: {
        regex: /\{\{.*?\}\}/,
    }
};

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
 * getTemplate
 * @returns {{error: null, template: null}}
 */
let getTemplate = function(){

    let statement = { error: null, template: null };

    let args = this.expression.arguments;
    if(!args.length) {
        return statement;
    }
    if(t.isStringLiteral(args[0])){
        let [{ value }] = args;
        statement.template = value;
    } else if(t.isTemplateLiteral(args[0])){
        let [{ quasis: [{ value: { raw } }] }] = args;
        statement.template = raw;
    } else {
        statement.error = `
            Please use StringLiteral ("foo") or TemplateLiteral (\`bar\`). Do not use
            something like this: "hello" + "World".
        `;
    }

    return statement;
};

/**
 * precompile
 * @howto precompile: https://github.com/wycats/handlebars.js/issues/1033
 * @this-param {string}
 * @returns {string}
 */
let precompile = function(engine){

    let preCompiled = null;
    if(engine === 'handlebars'){
        preCompiled = `(${handlebars.precompile(this)})`;
    }


    return preCompiled;
};

/**
 * createAst
 * @this-param {string}
 * @param vars {object}
 * @returns {ast}
 */
let createAst = function(vars = {}){

    let compileTemplate = template(this);
    return compileTemplate(vars);
};

function plugin () {

    return {
        visitor: {
            ClassDeclaration(path, { opts }){

                let { engine } = opts;
                let { regex } = engines[engine];

                let [ component ] = path::getDecorator('view');
                if(!component){
                    return;
                }

                let { error, template } = component::getTemplate();

                if(error){
                    throw new Error(error);
                }

                if(!template){
                    return;
                }

                // do nothing when not template vars e.g. {{foo}} found
                if(!regex.test(template)){
                    return;
                }

                let precompiled = template::precompile(engine);
                let ast = precompiled::createAst();

                component.expression.arguments.splice(0, 1, ast.expression);
            }
        }
    };
}

export default plugin;