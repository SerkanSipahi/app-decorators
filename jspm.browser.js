SystemJS.config({
  defaultJSExtensions: true,
  paths: {
    "github:*": "jspm_packages/github/*",
    "npm:*": "jspm_packages/npm/*",
    "app/*": "app/*",
    "src/*": "src/*",
    "test/*": "test/*",
  },
});
