SystemJS.config({
    "transpiler": false,
    "paths": {
        "github": "jspm_packages/github/",
        "npm:": "jspm_packages/npm/",
        "app-decorators/": "node_modules/app-decorators/"
    },
    "map": {
        "app-decorators": "app-decorators/src/index",
        "app-decorators/src/bootstrap": "app-decorators/src/bootstrap",
        "app-decorators/src/libs/customelement": "app-decorators/src/libs/customelement",
        "app-decorators/src/libs/random-storage": "app-decorators/src/libs/random-storage",
        "app-decorators/src/libs/element-to-function": "app-decorators/src/libs/element-to-function",
    },
    "packages": {
        "lib": {
            "defaultExtension": "js"
        },
        "node_modules": {
            "defaultExtension": "js"
        }
    }
});

SystemJS.config({
    packageConfigPaths: [
        "npm:@*/*.json",
        "npm:*.json",
        "github:*/*.json"
    ],
    map: {
        "jquery": "npm:jquery@3.2.1"
    },
    packages: {}
});