var express = require("express");
var app = express();

app.use('/static',express.static("public"));


app.get("/hello",function (req,res){
    res.send("<h1>Hello World!</h1>")
});
app.listen(3000);