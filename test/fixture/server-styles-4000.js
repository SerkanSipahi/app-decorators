let express = require('express');
let app = express();

app.use(express.static('./test/fixture'));
app.listen(4000, () => console.log(`Server: localhost for styles: ${4000}`));