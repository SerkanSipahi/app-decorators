import * as postcss from 'postcss';

/**
 * create Config
 * @param attachOn {string}
 * @param styles {string}
 */
let createConfig = (attachOn, styles) => ({ attachOn, styles: `${styles} ` });

/**
 * Determine if node is on root layer
 * @param node {object}
 */
let isRootNode = node => node.parent && /root/.test(node.parent.type);

/**
 * Stringify ast node
 * @param node {object}
 * @returns {string}
 */
let stringifyAstNode = node => {

    if(!node || (node && !node.type)) {
        throw new Error('Failed: please pass AST node!');
    }

    let result = '';
    postcss.stringify(node, i => result += i);

    return result;
};

/**
 * Stringify ast nodes
 * @param nodes {Array}
 * @returns {string}
 */
let stringifyAstNodes = nodes => {

    if(!nodes || (nodes && !nodes.length)) {
        throw new Error('Failed: please pass AST collection; array[ast1, ast2, ast3]');
    }

    let result = '';
    nodes.forEach(node => result += stringifyAstNode(node));

    return result;
};

/**
 * Get at rule config
 * @param atRuleNode {object}
 * @returns {object|undefined}
 */
let getAtRuleConfig = atRuleNode => {

    if(atRuleNode.name === 'on' && !isRootNode(atRuleNode)){
        throw new Error('Failed: please use @on at root layer');
    }

    if(!atRuleNode.nodes) {
        return;
    }

    let matcher = /\(("|')?([a-z]+)("|')\)/i;
    let params  = atRuleNode.params;
    let matched = params.match(matcher);
    if(!matched) {
        throw new Error(['Failed: only letters allowed', params]);
    }

    let atRuleConfig = createConfig(matched[2], stringifyAstNodes(atRuleNode.nodes));
    return atRuleConfig;
};

/**
 * Get rule config
 * @param ruleNode {object}
 * @returns {object|undefined}
 */
let getRuleConfig = ruleNode => {

    if(!isRootNode(ruleNode)) {
        return;
    }

    let styleEvent = createConfig('immediately', stringifyAstNode(ruleNode));
    return styleEvent;
};

/**
 * Parse passed css styles
 * @param styles {string}
 * @returns {Array}
 */
let parse = styles => {

    let configs = [];
    let ast = postcss.parse(styles);

    ast.walkAtRules(atRuleNode => {
        let atRuleconfig = getAtRuleConfig(atRuleNode);
        if(atRuleconfig) {
            configs.push(atRuleconfig);
        }
    });

    ast.walkRules(ruleNode => {
        let ruleConfig = getRuleConfig(ruleNode);
        if(ruleConfig) {
            configs.push(ruleConfig);
        }
    });

    return configs
};

export {
    parse,
}
