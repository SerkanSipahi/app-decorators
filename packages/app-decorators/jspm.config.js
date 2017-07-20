SystemJS.config({
    "transpiler": false,
    "packageConfigPaths": [
        "npm:@*/*.json",
        "npm:*.json",
        "github:*/*.json"
    ],
    "paths": {
        "github": "jspm_packages/github/",
        "npm:": "jspm_packages/npm/",
        "app-decorators/": "node_modules/app-decorators/"
    },
    "map": {
        "app-decorators": "app-decorators/src/index",
        "app-decorators/src/bootstrap": "app-decorators/src/bootstrap",
        "app-decorators/src/libs/customelement": "app-decorators/src/libs/customelement",
        "app-decorators/src/libs/random-storage": "app-decorators/src/libs/random-storage"
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