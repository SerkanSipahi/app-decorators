System.config({
    transpiler: false,
    packageConfigPaths: [
        "npm:@*/*.json",
        "npm:*.json",
        "github:*/*.json"
    ],
    paths: {
        "github:": "jspm_packages/github/",
        "npm:": "jspm_packages/npm/",
        "app-dec:": "node_modules/app-decorators/",
        "src/": "src/",
        "test/": "test/",
    },
    map: {
        "app-decorators": "app-dec:lib/index",
        "app-decorators/bootstrap": "app-dec:lib/bootstrap",
        "app-decorators-helper/register-customelement": "app-dec:lib/libs/customelement",
        "app-decorators-helper/random-storage": "app-dec:lib/libs/random-storage",
    },
    packages: {
        "node_modules": {
            "defaultExtension": "js"
        },
        "src": {
            "defaultExtension": "js"
        },
        "test": {
            "defaultExtension": "js"
        },
    }
});