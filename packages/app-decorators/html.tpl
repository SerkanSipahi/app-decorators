<!doctype html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>{{appname}}</title>
    </head>
    <body>
        <app-{{appname}}></app-{{appname}}>
        <script src="./node_modules/systemjs/dist/system.js"></script>
        <script src="./node_modules/app-decorators/bootstrap.js"></script>
        <script src="./node_modules/app-decorators/jspm.config.js"></script>
        <script src="./node_modules/app-decorators/runtime.js"></script>
        <script>
            bootstrap('src/app');
        </script>
    </body>
</html>