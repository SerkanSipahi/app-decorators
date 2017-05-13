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
        <script>
            bootstrap('src/index');
        </script>
    </body>
</html>