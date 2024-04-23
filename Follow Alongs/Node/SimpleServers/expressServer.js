    var express = require("express");
    var app = express();
    let counter = 0;
    app.use('/static',express.static("public"));

    app.post("/myPost", function(req,res){
        res.send("HTML cod. Done via a post request");
    })
    app.get("/users/:username", function(req,res){
        let username = req.params.username;
        res.send("<h1>"+ username+"</h1>");
    })

    app.get("/hello",function (req,res){
        let name = req.query.name;
        let age = req.query.age;



        res.send("<h1>Hello " + name + "!</h1>"
            +"You are "+ age + "years old."
        );
    });


    app.set('views','./views')
    app.set('view engine','pug')

    app.get('/pug/', function(req,res){
        let array = [
            {name: "Kai"},
            {name: "Quang"},
            {name: "Anh"}
        ]
        res.render('index',{title: 'Hey', message: 'Hello there!',arr: array})
    })
    app.get('/pug/hello', function(req,res){
        res.render('hello',{ title: 'Hello Button',count: counter})
    })
    app.listen(3000);