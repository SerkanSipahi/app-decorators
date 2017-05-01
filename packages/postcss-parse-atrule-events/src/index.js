import * as compiler from 'postcss';
import postcss from 'postcss';
import nestedCss from 'postcss-nested';

/**
 * create Config
 * @param attachOn {string}
 * @param styles {string}
 * @param type {string}
 * @param imports {Array}
 * @returns {{ attachOn: string, styles: string }}
 */
let createConfig = (attachOn, styles, type, imports) => ({
    attachOn, styles: `${styles} \n`, type, imports,
});

/**
 * Determine if node is on root layer
 * @param node {{
 *   parent: {
 *      type: string
 *   }
 * }}
 * @returns boolean
 */
let isRootNode = node => node.parent && /root/.test(node.parent.type);

/**
 * push when config
 * @param container {Array}
 * @param config {object}
 */
let push = (container, config) => {

    if(!config){
        return;
    }

    if(!container.length){
        container.push(config);
        return;
    }

    container.push(config);
};

/**
 * Stringify ast node
 * @param node {{
 *   type: string
 * }}
 * @returns {string}
 */
let stringifyAstNode = node => {

    if(!node || (node && !node.type)) {
        throw new Error('Failed: please pass AST node!');
    }

    let result = '';
    compiler.stringify(node, i => result += i);
    return result;
};

/**
 * Stringify ast nodes
 * @param nodes {Array}
 * @returns {string}
 */
let stringifyAstNodes = nodes => {

    let result = '';
    if(!nodes || (nodes && !nodes.length)) {
        return result;
    }

    nodes.forEach(node => result += stringifyAstNode(node));
    return result;
};

/**
 * Get at rule config
 * @param node {{
 *   nodes: Array,
 *   params: string,
 *   name: string
 * }}
 * @returns {object|null}
 */
let getAtRuleConfig = node => {

    let { nodes, params } = node;
    if(!nodes) {
        return null;
    }

    let pattern = /(rel|on)\(("|')?([a-z]+)("|')\)/i;
    let [,type,,attachOn] = params.match(pattern) || [];
    if(!type && node.name !== 'media') {
        // kann aufgenommen werden
        return null;
    }

    // nodes of @on and @rel
    // collect imports
    let importIndexes = [];
    let imports = [];

    /**
     * In Funktion auslagern, so das hier dann per if geprüft werden kann
     * ob @on oder @rel, ansonsten kann es immediately aufgenommen werden
     */
    for(let i = 0; i < node.nodes.length; i++) {

        let _node = node.nodes[i];

        // no childs found
        if(!_node.walkAtRules){
            continue;
        }

        if(_node.name !== 'fetch'){
            continue;
        }

        if(!_node.params) {
            throw new Error('Failed: not path declared', {
                correct : '@fetch load/my111/styles2.css',
                wrong: '@fetch',
            });
        }

        //keep index of @fetch ...
        importIndexes.push(i);
        // push @fetch value
        imports.push(_node.params);
    }

    // remove @fetch
    // http://stackoverflow.com/questions/9425009/remove-multiple-elements-from-array-in-javascript-jquery#9425230
    for (let i = importIndexes.length -1; i >= 0; i--){
        node.nodes.splice(importIndexes[i],1);
    }

    return createConfig(attachOn, stringifyAstNodes(node.nodes), type, imports);
};

/**
 * Get rule config
 * @param node {object}
 * @returns {object}
 */
let getRuleConfig = node => {

    if(!isRootNode(node)) {
        return null;
    }

    return createConfig('immediately', stringifyAstNode(node), 'default', []);
};

/**
 * will check the grammar
 * @param container {Array}
 * @param config {object}
 * @param pushUniqueKey {string}
 */
let grammarCheck = node => {

    // grammarCheck()
    // 1.) Wenn @import und parent @on dann passt
    // 2.) Wenn @import und parent @rel dann passt
    // 3.) Wenn selectoren und parent @rel dann macht kein sinn
    // 3.) Wenn selectoren und parent @on dann macht sinn
    // 4.) Wenn @import + !property und parent @rel dann macht kein sinn
    // 5.) Wenn @import + !property und parent @on dann passt

    return {}
};

let optimize = simpleAst => {
    return simpleAst;
};

/**
 * Parse passed css styles
 * @param styles {string}
 * @param options {{optimize: boolean, grammarCheck: boolean}}
 * @returns {Array}
 */
let parse = (styles, options = {}) => {

    let container = [];
    let ast = compiler.parse(
        postcss([nestedCss]).process(styles).content
    );

    // walk trough @media rel('preload'), @media on(...)
    ast.walkAtRules(node =>
        push(container, getAtRuleConfig(node))
    );

    // walk trough classic css selectors
    ast.walkRules(node =>
        push(container, getRuleConfig(node))
    );

    if(options.optimize){
        container = optimize(container);
    }

    if(options.grammarCheck) {
        grammarCheck(container);
    }

    return container;
};

export {
    parse,
}