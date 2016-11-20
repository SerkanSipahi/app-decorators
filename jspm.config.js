SystemJS.config({
  transpiler: false
});
SystemJS.config({
  map: {
    "app-decorators-helper/register-customelement": "src/libs/customelement",
    "app-decorators-helper/random-storage": "src/libs/random-storage",
  }
});
SystemJS.config({
  packageConfigPaths: [
    "npm:@*/*.json",
    "npm:*.json",
    "github:*/*.json"
  ],
});
