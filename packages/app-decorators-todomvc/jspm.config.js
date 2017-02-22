System.config({
    "transpiler": false,
    "packageConfigPaths": [
        "npm:@*/*.json",
        "npm:*.json",
        "github:*/*.json"
    ],
    "paths": {
        "github": "jspm_packages/github/",
        "npm:": "jspm_packages/npm/",
        "src/": "lib/",
        "test/": "test/",
        "app-decorators/": "node_modules/app-decorators/"
    },
    "map": {
        "app-decorators": "app-decorators/src/index",
        "app-decorators/bootstrap": "app-decorators/src/bootstrap",
        "app-decorators-helper/register-customelement": "app-decorators/src/libs/customelement",
        "app-decorators-helper/random-storage": "app-decorators/src/libs/random-storage"
    },
    "packages": {
        "src": {
            "defaultExtension": "js"
        },
        "test": {
            "defaultExtension": "js"
        },
        "node_modules": {
            "defaultExtension": "js"
        }
    }
});