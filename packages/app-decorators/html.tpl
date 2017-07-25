<!doctype html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>com-{{name}}</title>
    </head>
    <body>
        <com-{{name}}></com-{{name}}>
        <script src="./node_modules/systemjs/dist/system.js"></script>
        <script src="./bootstrap.js"></script>
        <script src="./jspm.config.js"></script>
        <script src="./runtime.js"></script>

        <!-- 1.) -->
        <!-- enable <script bundle> when using "jspm bundle" and target "appname" name is "not" equal src "appname" -->
        <!-- jspm bundle lib/app - app-decorators dist/src/bundle.js -->
        <!-- <script src="./lib/bundle.js"></script> -->
        <!-- when src "appname" is equal target "appname", you dont need extra bundle file before -->

        <!-- 2.) -->
        <!--
            when runtime.js is removed, then it will load appdec libs
            separately (see network panel) otherwise just runtime.js
        -->

        <script>
            /**
             * jspm bundle lib/app - app-decorators dist/src/bundle.js
             * - the bundle name is the initianal start name of bootstrap
             */
            bootstrap('lib/index');
        </script>
    </body>
</html>