let compression = require('compression');
let express = require('express');
let app = express();
app.use(compression());

let [,,type, number] = process.argv;
let port = 3000;
type === 'port' && number && (port = number);

app.use(express.static('./dist'));
app.listen(port, () => console.log(`Server: localhost: ${port}`));
