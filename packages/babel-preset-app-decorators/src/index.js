import transformAppDecComponent from "babel-plugin-app-decorators-component";
import transformAppDecComponentRegister from 'babel-plugin-app-decorators-component-register';
import transformAppDecViewPrecompiler from 'babel-plugin-app-decorators-view-precompile';
import transformAppDecStylePrecompiler from 'babel-plugin-app-decorators-style-precompile';
import transformDecoratorsLegacy from "babel-plugin-transform-decorators-legacy";
import transformClassProperties from "babel-plugin-transform-class-properties";
import transformFunctionBind from "babel-plugin-transform-function-bind";

export default {
    plugins: [
        [transformAppDecComponent, {
            "elementToFunc": true,
        }],
        [transformAppDecComponentRegister, {
            "storage_pointer": '@component',
            "imports": [
                { "IMPORT_NAME": "Register", "SOURCE": "app-decorators/src/libs/customelement" },
                { "IMPORT_NAME": "storage",  "SOURCE": "app-decorators/src/libs/random-storage" },
            ],
        }],
        [transformAppDecViewPrecompiler, {
            "engine": "handlebars"
        }],
        [transformAppDecStylePrecompiler, {
            "minify": true,
            "normalize": true,
            "autoprefixer": [],
        }],
        transformDecoratorsLegacy,
        transformClassProperties,
        transformFunctionBind,
    ]
};