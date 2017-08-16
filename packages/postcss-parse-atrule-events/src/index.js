import * as compiler from 'postcss';
import postcss from 'postcss';
import nestedCss from 'postcss-nested';
import matchMediaQuery from 'regex-css-media-query';
import values from 'core-js/library/fn/object/values';

const IMMEDIATELY = "immediately";
const DEFAUlT = "default";
const MEDIA_MATCH = "mediaMatch";
const IMPORT_REGEX = /fetch|stream/;

/**
 * create Config
 * @param attachOn {string}
 * @param styles {string}
 * @param type {string}
 * @param imports {Array}
 * @returns {{ attachOn: string, styles: string }}
 */
let createConfig = (attachOn, styles, type, imports) => ({
    attachOn, styles: (styles ? `${styles} \n` : ''), type, imports,
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

    nodes.forEach(node => result += stringifyAstNode(node)+" \n");
    return result;
};

/**
 * Stringify ast nodes
 * @param nodes {Array}
 * @returns {Array}
 */
let resolveMediaChildNodes = nodes => {

    // nodes of @on and @rel
    // collect imports
    let imports = [];
    let importIndexes = [];

    for(let i = 0, len = nodes.length; i < len; i++) {

        let { walkAtRules, name, params } = nodes[i];

        // no childs found
        if(!walkAtRules){
            continue;
        }
        let mached = `${name}`.match(IMPORT_REGEX);
        if(!mached){
            continue;
        }

        //keep index of @fetch ...
        importIndexes.push(i);
        // push @fetch value
        imports.push(params);
    }

    // remove @fetch
    // http://stackoverflow.com/questions/9425009/remove-multiple-elements-from-array-in-javascript-jquery#9425230
    for (let i = importIndexes.length -1; i >= 0; i--){
        nodes.splice(importIndexes[i],1);
    }

    return [nodes, imports];
};

/**
 * Get at rule config
 * @param node {object}
 * @returns {object|null}
 */
let getAtRuleConfig = node => {

    let { nodes, params, parent, name } = node;

    /**
     * if something on root layer that we can accept, then take it, e.g. fetch or stream.
     */
    let mached = `${name}`.match(IMPORT_REGEX);
    if(mached && parent.type === 'root') {
        return createConfig(IMMEDIATELY, '', DEFAUlT, [params]);
    }

    /**
     * we also accept @media, so take it.
     */
    let isMediaQuery = name == "media" && matchMediaQuery().test(params);
    let pattern = /(on|action|query)\(("|')?(.*?)("|')?\)/i;
    let [,type,,attachOn] = params.match(pattern) || (isMediaQuery && [,MEDIA_MATCH,,params]) || [];

    if(type && attachOn && nodes && nodes.length) {
        let [newNodes, imports ] = resolveMediaChildNodes(nodes);
        return createConfig(attachOn, stringifyAstNodes(newNodes), type, imports);
    }

    /**
     * if something like @import, @document, etc. so take it, but normal styles
     */
    if(parent.type === 'root') {
        return createConfig(IMMEDIATELY, stringifyAstNodes([node]), DEFAUlT, []);
    }

    // Everything else can be skipped!
};

/**
 * Get rule config
 * @param node {object}
 * @returns {object}
 */
let getRuleConfig = node => {

    // skip if rule (selector) has atRule as parent
    if(!isRootNode(node)) {
        return null;
    }

    return createConfig(IMMEDIATELY, stringifyAstNode(node), DEFAUlT, []);
};

/**
 * will check the grammar
 * @param container {Array}
 * @param config {object}
 * @param pushUniqueKey {string}
 */
let grammarCheck = node => {

    // grammarCheck()
    // 1.) Wenn @fetch und parent @on dann passt
    // 2.) Wenn @fetch und parent @rel dann passt
    // 3.) Wenn selectoren und parent @rel dann macht kein sinn
    // 3.) Wenn selectoren und parent @on dann macht sinn
    // 4.) Wenn @fetch + !property und parent @rel dann macht kein sinn
    // 5.) Wenn @fetch + !property und parent @on dann passt
    // 6.) Wenn @fetch ohne value dann failed
    // 7.) Wenn @import in @media dann nicht erlaubt

    return {}
};

/**
 * optimize
 * @param eventRules {Array}
 */
let optimize = eventRules => {

    let optimizedRules = {};
    for(let rule of eventRules){
        let uniqName = `${rule.attachOn}::${rule.type}`;
        if(!optimizedRules[uniqName]){
            optimizedRules[uniqName] = {
                attachOn: rule.attachOn,
                imports: [],
                styles: '',
                type: rule.type
            };
        }
        if(rule.imports.length){
            optimizedRules[uniqName].imports.push(...rule.imports);
        }
        if(rule.styles){
            optimizedRules[uniqName].styles += rule.styles;
        }
    }

    return values(optimizedRules);
};

/**
 * Parse passed css styles
 * @param styles {string}
 * @param options {object}
 * @returns {Array}
 */
let parse = (styles, options = {}) => {

    let container = [];
    let ast = compiler.parse(
        // normalize nested css before converting to ast
        postcss([nestedCss]).process(styles).content
    );

    // walk trough classic css selectors
    ast.walkRules(node => push(container, getRuleConfig(node)));

    // walk trough @media rel('preload'), @media on(...)
    ast.walkAtRules(node => push(container, getAtRuleConfig(node)));

    // combine/concat same attachOn´s
    options.optimize ? container = optimize(container) : null;

    // check in which constellation @media on() and @media rel() allowed
    options.grammarCheck ? grammarCheck(container) : null;

    return container;
};

export {
    parse,
}