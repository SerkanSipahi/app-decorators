SystemJS.config({
    transpiler: false,
    map: {
        "app-decorators": "src/index",
        "app-decorators/bootstrap": "src/bootstrap",
        "app-decorators-helper/register-customelement": "src/libs/customelement",
        "app-decorators-helper/random-storage": "src/libs/random-storage"
    },
    packages: {
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

SystemJS.config({
    packageConfigPaths: [
        "npm:@*/*.json",
        "npm:*.json",
        "github:*/*.json"
    ],
});
