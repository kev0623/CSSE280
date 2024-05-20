var express = require("express");
var app = express();
const logger = require("morgan");
app.use( logger('dev') ); //helpful information serverside when requests come in

var bodyParser = require("body-parser");
app.use('/ElizaAPI', bodyParser.urlencoded( {extended: true}));
app.use('/ElizaAPI', bodyParser.json() );


app.use('/', express.static("public") );
const Eliza = require('eliza-as-promised');
/////////////////////////////////////////////////////////////////
//   YOU SHOULD NOT NEED TO CHANGE ANYTHING ABOVE THIS LINE    //
/////////////////////////////////////////////////////////////////
var eliza = new Eliza();


app.use('/', express.static("public") );

const forbiddenTopics = ["Perdue", "weekend wednesdays", "daylight savings time"];
// TODO:
//  1. create a GET endpoint for  /ElizaAPI/getInitial
//  2. create a second endpoint to take in a statement and return a response
//  
//  You can get partial credit if you create the endpoints and they only return a fixed response:
//  "PARTIAL_CREDIT_GET_INITIAL"
//  "PARTIAL_CREDIT_ELIZA_RESPONSE"
//
//  You can get partial credit if you have the eliza-server use the console to log what the response should be 
//  even if you cannot get the endpoint to properly return the response.

app.get('/ElizaAPI/getInitial', function(req, res) {
    res.send(eliza.getInitial());
  });

  app.post('/ElizaAPI/getResponse', function(req, res) {
    const statement = req.body.statement;

    let containsForbiddenTopic = false;
    let forbiddenTopic = '';

    for (const topic of forbiddenTopics) {
        if (statement.toUpperCase().includes(topic.toUpperCase())) {
            containsForbiddenTopic = true;
            forbiddenTopic = topic;
            break;
        }
    }

    if (containsForbiddenTopic) {
        res.send("I'm sorry, I'm not comfortable talking about " + forbiddenTopic);
        return;
    }

    eliza.getResponse(statement)
        .then((response) => {
            if (response.reply) {
                // console.log(response.reply);
                res.send(response.reply ); 
            }
            if (response.final) {
                // console.log(response.final);
                res.send(response.final );
            }
        })
        .catch((error) => {
            console.error('Error processing the statement:', error);
        });
});




//DO NOT MODIFY THIS
app.listen(3000);