import * as t from "babel-types";
import template from 'babel-template';

/**
 * Template for import statements
 */
let compileImportTemplate = template(`
    import * as IMPORT_NAME from 'SOURCE';
`, { sourceType: "module" });

/**
 * Template for "Register.customElement"
 */
let compileRegisterTemplate = template(`
    REGISTER_VALUE.REGISTER_VALUE_ORIG.customElement(
        CLASS_NAME, STORAGE_VALUE.STORAGE_VALUE_ORIG.get(CLASS_NAME).get(STORAGE_POINTER)
    );
`);

/**
 * buildImportAst
 * @param data {{IMPORT_NAME: string, SOURCE: string}}
 * @returns {object} ast
 */
let buildImportAst = data => {

    let { IMPORT_NAME, SOURCE } = data;
    let ast = compileImportTemplate({
        IMPORT_NAME : t.identifier(IMPORT_NAME),
    });
    ast.source.value = SOURCE;
    ast._$importName = IMPORT_NAME;
    ast._$source = SOURCE;

    return ast;
};

/**
 * buildRegisterAst
 * @param data {{
     *     CLASS_NAME: string,
     *     REGISTER_VALUE: string,
     *     REGISTER_VALUE_ORIG: string,
     *     STORAGE_VALUE: string,
     *     STORAGE_VALUE_ORIG: string
     * }}
 * @returns {object}
 */
let buildRegisterAst = data => {

    return compileRegisterTemplate({
        CLASS_NAME : t.identifier(data.CLASS_NAME),
        STORAGE_POINTER: t.stringLiteral(data.STORAGE_POINTER),
        REGISTER_VALUE: t.identifier(data.REGISTER_VALUE),
        REGISTER_VALUE_ORIG: t.identifier(data.REGISTER_VALUE_ORIG),
        STORAGE_VALUE: t.identifier(data.STORAGE_VALUE),
        STORAGE_VALUE_ORIG: t.identifier(data.STORAGE_VALUE_ORIG),
    });
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
 * addImports
 * @param path {object}
 * @param imports {array}
 * @param programImports {array}
 * @param programBody {object}
 */
let addImports = function(path, imports, programImports, programBody) {

    imports.forEach(imp => {

        let result = null;
        for(let prImp of programImports){

            imp.IMPORTED =
                imp.IMPORT_NAME === prImp.IMPORT_NAME &&
                imp.SOURCE === prImp.SOURCE;

            if(imp.IMPORTED){
                result = prImp;
                break;
            }
        }

        if(!result){
            let createdImportAst = this::buildImport(imp, path);
            programBody.unshift(createdImportAst);
        }
    });
};

/**
 * buildImport
 * @param data {object}
 * @param path {object}
 * @returns {Object}
 */
let buildImport = function(data, path) {

    let { IMPORT_NAME, SOURCE } = data;
    let IMPORT_NAME_UID = path.scope.generateUidIdentifier(IMPORT_NAME).name;

    this.cache.set(`${IMPORT_NAME}-value`, IMPORT_NAME_UID);
    this.cache.set(`${IMPORT_NAME}-value-orig`, IMPORT_NAME);

    return buildImportAst({
        IMPORT_NAME: IMPORT_NAME_UID,
        SOURCE: SOURCE
    });
};

let setDecoratorState = function(self, path) {

    let component = path::getDecorator('component');
    if(component.length){
        self.cache.set('decorator', true);
    }
};

/**
 * getImportDeclaration
 * @param path {object}
 * @returns {Array}
 */
let getImportDeclaration = path => {

    // lookup for import
    let importPath = path.node.source.value;
    if(!importPath){
        return;
    }

    // create import object { IMPORT_NAME: 'foo', SOURCE: './a' }
    let imports = path.node.specifiers.map(({ local }) => {
        return {
            IMPORT_NAME: local.name,
            SOURCE: importPath,
        };
    });

    return imports;
};

/**
 * getClassName
 * @param path
 * @returns {string};
 */
let getClassName = path => path.node.id.name;

function plugin() {

    return {
        pre(){
            this.cache = new Map();
            this.cache.set('decorator', false);
        },
        post(){
            this.cache.clear();
        },
        visitor: {
            Program(path, state) {

                let optionsImports = state.opts.imports;
                let programBody = path.node.body;

                if(optionsImports.length !== 2){
                    throw new Error('Please pass Register and storage');
                }

                /**
                 * Check that @component exist
                 */
                let self = this;
                path.traverse({
                    ClassDeclaration: path => setDecoratorState(self, path),
                });
                if(!self.cache.get('decorator')){
                    return;
                }

                /**
                 * Check that required imports already imported
                 */
                let programImports = [];
                path.traverse({
                    ImportDeclaration: path => {
                        let imports = getImportDeclaration(path);
                        programImports.push(...imports);
                    },
                });

                this::addImports(path, optionsImports, programImports, programBody);


            },
            ClassDeclaration(path, state) {

                let { storage_pointer } = state.opts;

                let component = path::getDecorator('component');
                if(!component.length){
                    return;
                }

                let [ imp1, imp2 ] = state.opts.imports;
                if(imp1.IMPORTED && imp2.IMPORTED){
                    return;
                }

                // build Register ast
                let registerAst = buildRegisterAst({
                    CLASS_NAME         : getClassName(path),
                    STORAGE_POINTER    : storage_pointer,
                    REGISTER_VALUE     : this.cache.get('Register-value'),
                    REGISTER_VALUE_ORIG: this.cache.get('Register-value-orig'),
                    STORAGE_VALUE      : this.cache.get('storage-value'),
                    STORAGE_VALUE_ORIG : this.cache.get('storage-value-orig'),
                });

                if(path.parentPath && path.parentPath.type === "ExportNamedDeclaration"){
                    path = path.parentPath;
                }
                path.insertAfter(registerAst);

            },
        },
    };
}

export default plugin;
