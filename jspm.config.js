SystemJS.config({
  transpiler: "plugin-babel",
  babelOptions: {
    "presents": [
      "babel-preset-stage-0"
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
