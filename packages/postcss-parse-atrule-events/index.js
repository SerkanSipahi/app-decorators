import * as postcss from 'postcss';

let isRootNode = node => node.parent && /root/.test(node.parent.type);

let stringifyNode = node => {

    if(!node || (node && !node.type)) {
        throw new Error('Failed: please pass AST node!');
    }

    let result = '';
    postcss.stringify(node, i => result += i);

    return result;
};

let stringifyNodes = nodes => {

    if(!nodes || (nodes && !nodes.length)) {
        throw new Error('Failed: please pass AST collection; array[ast1, ast2, ast3]');
    }

    let result = '';
    nodes.forEach(node => result += stringifyNode(node));

    return result;
};

export default postcss.plugin('postcss-reverse-props', _ => {

    let walkAtRules = atRuleNode => {

        if(atRuleNode.name === 'on' && !isRootNode(atRuleNode)){
            throw new Error('Failed: please use @on at root layer');
        }

        if(!atRuleNode.nodes) {
            return;
        }

        console.log(stringifyNodes(atRuleNode.nodes));
    };

    let walkRules = ruleNode => {

        if(!isRootNode(ruleNode)) {
            return;
        }

        console.log(stringifyNode(ruleNode));
    };

    return root => {
        root.walkAtRules(walkAtRules);
        root.walkRules(walkRules)
    };
});
