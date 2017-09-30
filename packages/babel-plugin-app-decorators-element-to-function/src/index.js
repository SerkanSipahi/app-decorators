import * as t from "babel-types";
import { elements } from "./elements";

let getProgram = node => {
    while(node.parent){
        node = node.findParent(node => node);
        if(node.key === "program"){
            return node;
        }
    }
};

let plugin = () => {

    let visitor = {
        ClassDeclaration(path) {

            // do nothing when no superClass found
            let {superClass} = path.node;
            if(!superClass){
                return;
            }

            let superClassName = superClass.name;
            if(!elements[superClassName]){
                return;
            }

            // replace extends identifier with "elementToFunc"
            let {name} = path.scope.generateUidIdentifier("elementToFunc");
            let node = t.callExpression(t.identifier(name), [t.identifier(superClassName)]);
            path.node.superClass = node;

            // create import statement for elementToFunc
            let importDeclaration = t.importDeclaration(
                [t.importDefaultSpecifier(t.identifier(name))],
                t.stringLiteral("app-decorators-element-to-function")
            );

            // add import statement to program body
            let program = getProgram(path);
            program.node.body.unshift(importDeclaration);
        },
    };

    return { visitor };
};

export default plugin;
