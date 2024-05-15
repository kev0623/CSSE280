var express = require("express");
var app = express();
app.use('/static', express.static("frontend/public") );
app.listen( 8080 );