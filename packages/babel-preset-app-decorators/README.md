# babel-preset-app-decorators

> Babel preset for app-decorators.

babel-preset-app-decorators Babeljs v6.x

<p>
    <a href="https://david-dm.org/SerkanSipahi/app-decorators?path=packages/babel-preset-app-decorators"><img src="https://david-dm.org/SerkanSipahi/david.svg" alt="Dependency Status"></a>
    <a href="https://david-dm.org/SerkanSipahi/app-decorators?path=packages/babel-preset-app-decorators&type=dev"><img src="https://david-dm.org/SerkanSipahi/david/dev-status.svg" alt="devDependency Status"></a>
</p>


## Install

```sh
$ npm install --save-dev babel-preset-app-decorators
```

## Usage

### Via `.babelrc` (Recommended)

**.babelrc**

```json
{
  "presets": ["app-decorators"]
}
```

### Via CLI

```sh
$ babel script.js --presets app-decorators 
```

### Via Node API

```javascript
require("babel-core").transform("code", {
  presets: ["app-decorators"]
});
```