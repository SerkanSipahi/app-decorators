import * as postcss from 'postcss';

/**
 * create Config
 * @param attachOn {string}
 * @param styles {string}
 * @returns {{ attachOn: string, styles: string }}
 */
let createConfig = (attachOn, styles) => ({ attachOn, styles: `${styles} ` });

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
 * @param node {{
 *   nodes: Array,
 *   params: string,
 *   name: string
 * }}
 * @returns {object|null}
 */
let getAtRuleConfig = node => {

    let { name, nodes, params } = node;

    if(name === 'on' && !isRootNode(node)){
        throw new Error('Failed: please use @on at root layer');
    }

    if(!nodes) {
        return null;
    }

    let pattern = /\(("|')?([a-z]+)("|')\)/i;
    let matched = params.match(pattern);
    if(!matched) {
        throw new Error(['Failed: only letters allowed', params]);
    }

    return createConfig(matched[2], stringifyAstNodes(node.nodes));
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

    return createConfig('immediately', stringifyAstNode(node));
};

/**
 * Parse passed css styles
 * @param styles {string}
 * @returns {Array}
 */
let parse = styles => {

    let configs = [];
    let ast = postcss.parse(styles);

    ast.walkAtRules(node => {
        let config = getAtRuleConfig(node);
        if(config) {
            configs.push(config);
        }
    });

    ast.walkRules(node => {
        let config = getRuleConfig(node);
        if(config) {
            configs.push(config);
        }
    });

    return configs;
};

export {
    parse,
}