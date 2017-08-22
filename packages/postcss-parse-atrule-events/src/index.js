import * as compiler from 'postcss';
import postcss from 'postcss';
import nestedCss from 'postcss-nested';
import autoprefixer from 'autoprefixer';
//import cssnano from 'cssnano';
import values from 'core-js/library/fn/object/values';

const IMMEDIATELY         = "immediately";
const DEFAUlT             = "default";
const IMPORT_REGEX        = /fetch|stream/;
const AT_RULE_REGEX       = /query|on|action|viewport/;
const POSTCSS_BUBBLES     = AT_RULE_REGEX.toString().replace(/\//g, '').split('|');
const OPTION_RADIUS_REGEX = new RegExp("" +
    "(?:\\s+)?(?:near)?(?:\\s)?" +                                  // near         [optional]
        "\\(" +                                                     // (            [required]
            "(?:(\\s+)?(radius)(?:\\s+)?:(?:\\s+)?(\\w+)(\\s+)?)" + // radius: 30px [e.g.]
        "\\)" +                                                     // )            [required]
    "(?:\\s+)?(?:near)?(?:\\s)?",                                   // near         [optional]
);

/**
 * @param v {string}
 * @returns {{option: (*|[*,*]|null), rawPropQuery: (*|null), input: (string|null)}}
 */
let matchRadiusQueryRule = v => {
    let matched = v.match(OPTION_RADIUS_REGEX) || [];
    let [rawPropQuery,,prop,value] = matched;
    return {
        option: prop&&value && [prop, value] || null,
        rawPropQuery: rawPropQuery || null,
        input: matched.input || null,
    }
};

/**
 * @param v {string}
 */
let escapeAtRuleQueryVars = v => v.replace(/\{\{(.*?)\}\}/g, v => v.replace(/[{}]/g, v => `\\${v}`));

/**
 * @param v {string}
 */
let unescapeAtRuleQueryVars = v => v.replace(/[\\]/g, '');

/**
 * create Config
 * @param attachOn {string}
 * @param styles {string}
 * @param type {string}
 * @param imports {Array}
 * @param option {Array}
 * @returns config {Array}
 */
let createConfig = (attachOn, styles, type, imports, option) => {
    let config = Object.assign({},
        {attachOn, type, imports},
        {styles: (styles ? `${styles} \n` : '')},
        (option ? {option} : {})
    );
    return config;
};

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
 * push config
 * @param container {Array}
 * @param config {object}
 */
let push = (container, config) => {

    if(!config) return;

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
 * @param name {string}
 * @returns {object}
 */
let createEventHandlerValue = params => {
    let eventName = params.replace(/ /g, '-');
    let eventValue = params;
    params = `${eventName} ${eventValue}`;
    return params;
};

let createEventHandlerNameByAtRule = (atRule, eventName) => {

    if(atRule === "action" && eventName.split(' ').length === 1){
        eventName = createEventHandlerValue(eventName);
    } else if(/query|viewport/.test(atRule)){
        eventName = createEventHandlerValue(eventName);
    }

    return eventName;
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
    let matched = `${name}`.match(IMPORT_REGEX);
    if(matched && parent.type === 'root') {
        return createConfig(IMMEDIATELY, '', DEFAUlT, [params], null);
    }

    if(AT_RULE_REGEX.test(name) && nodes && nodes.length) {

        let matched = {};
        if(/action/.test(name)){
            params = unescapeAtRuleQueryVars(params);
        }
        else if(/query|viewport/.test(name)){
            matched = matchRadiusQueryRule(params);
            params = matched.input ? matched.input.replace(matched.rawPropQuery, "") : params;
        }

        params = createEventHandlerNameByAtRule(name, params);

        let [newNodes, imports] = resolveMediaChildNodes(nodes);
        let config = createConfig(params, stringifyAstNodes(newNodes), name, imports, matched.option);

        return config;
    }

    /**
     * if something like @import, @document, etc. so take it, but normal styles
     */
    if(parent.type === 'root') {
        return createConfig(IMMEDIATELY, stringifyAstNodes([node]), DEFAUlT, [], null);
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

    return createConfig(IMMEDIATELY, stringifyAstNode(node), DEFAUlT, [], null);
};

/**
 * will check the grammar
 * @param eventRules {Array}
 */
let grammarCheck = eventRules => {

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
 * @param rule {Object}
 */
let getUniqueNameForOptimize = rule => (
    `${rule.attachOn}::${rule.type}${rule.option && "::"+rule.option.join("-")}`
);

/**
 * optimize
 * @param eventRules {Array}
 */
let optimize = eventRules => {

    let optimizedRules = {};
    for(let rule of eventRules){

        let uniqName = getUniqueNameForOptimize(rule);
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
        if(rule.option){
            optimizedRules[uniqName].option = rule.option;
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

    styles = escapeAtRuleQueryVars(styles);

    if(typeof styles !== "string"){
        throw new Error('Please styles as string!');
    }

    let container = [];
    // normalize nested css before converting to ast
    let content = postcss([nestedCss({ bubble: POSTCSS_BUBBLES })/*, prefixer*/]).process(styles).content;
    let ast = compiler.parse(content);

    // walk trough classic css selectors
    ast.walkRules(node => push(container, getRuleConfig(node)));

    // walk trough @ action /my/{{foo}}/route.html, @on ...
    ast.walkAtRules(node => push(container, getAtRuleConfig(node)));

    // combine/concat same attachOn´s
    options.optimize ? container = optimize(container) : null;

    // check in which constellation @ allowed
    options.grammarCheck ? grammarCheck(container) : null;

    return container;
};

export {
    parse,
    matchRadiusQueryRule,
    escapeAtRuleQueryVars,
    unescapeAtRuleQueryVars,
    createEventHandlerValue,
    createEventHandlerNameByAtRule,
}