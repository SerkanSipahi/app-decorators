System.config({
  baseURL: "base",
  defaultJSExtensions: true,
  transpiler: "babel",
  babelOptions: {
    "stage": 0,
    "optional": [
      "runtime",
      "optimisation.modules.system"
    ]
  },
  paths: {
    "app/*": "app/*",
    "src/*": "src/*",
    "test/*": "test/*",
    "github:*": "jspm_packages/github/*",
    "npm:*": "jspm_packages/npm/*"
  },
});
