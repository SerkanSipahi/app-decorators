SystemJS.config({
  transpiler: "plugin-babel",
  babelOptions: {
    "presents": [
      "babel-preset-es2015"
    ],
    "plugins": [
      "babel-plugin-transform-decorators-legacy",
      "babel-plugin-transform-class-properties",
      "babel-plugin-transform-function-bind"
    ]
  },
  packages: {}
});

SystemJS.config({
  packageConfigPaths: [
    "npm:@*/*.json",
    "npm:*.json",
    "github:*/*.json"
  ],
});
