var express = require("express");
var app = express();
var cors = require("cors");
var bodyParser = require("body-parser");
const FantasyCharacter = require('./models/fantasyCharacter');
const logger = require("morgan");
require('./models/db');

//middleware
app.use(cors());
app.use(logger('dev')); //helpful information serverside when requests come in
app.use('/api/', bodyParser.urlencoded({ extended: true }));
app.use('/api/', bodyParser.json());

//PROVIDED

//READ ALL characters
app.get("/api/", function (req, res) {
    FantasyCharacter.find({}, (err, characters) => {
        if (err) {
            res.status(404);
            res.json(err);
        } else {
            res.status(200);
            res.json(characters);
        }
    });

});


//CREATE a character given data
app.post("/api/", function (req, res) {
    let name = req.body.name;
    let house = req.body.house;
    let level = req.body.level;
    FantasyCharacter.create({
        name: name,
        house: house,
        level: level
    }, (err, entry) => {
        if (err) {
            res.status(400);
            res.json(err);
        } else {
            res.status(201);
            res.json(entry);
        }
    });

});

//READ ONE character given an id
app.get("/api/id/:id", function (req, res) {
    let id = req.params.id;
    FantasyCharacter.findById(id, (err, entry) => {
        if (err) {
            res.status(404);
            res.json(err);
        } else {
            res.status(200);
            res.json(entry);
        }
    });
})

// Provided method for your convenience
function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

// Lists to use to generate random characters
const names = ["Harry Potter", "Hermione Granger", "Ron Weasely", "Albus Dumbledore", "Daenerys Targaryen", "Arya Stark", "Margaery Tyrell", "Joffrey Baratheon", "Tyrion Lannister"]
const houses = ["Gryffindor", "Ravenclaw", "Slytherin", "Hufflepuff", "Targaryen", "Stark", "Lannister", "Tyrell", "Baratheon"]
const levels = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]


/////////////////////////////////////////////////////////////////
//   YOU SHOULD NOT NEED TO CHANGE ANYTHING ABOVE THIS LINE    //
/////////////////////////////////////////////////////////////////


//TODO: make a GET  /api/randomCharacter  endpoint
//GET /api/randomCharacter endpoint
app.get("/api/randomCharacter", function (req, res) {
    let randomName = names[getRandomInt(names.length)];
    let randomHouse = houses[getRandomInt(houses.length)];
    let randomLevel = levels[getRandomInt(levels.length)];

    let randomCharacter = {
        name: randomName,
        house: randomHouse,
        level: randomLevel
    };

    res.status(200).json(randomCharacter);
});
//TODO: make a PUT  endpoint  that updates the database given a particular id
//PUT endpoint to update a character by ID
app.put("/api/id/:id", function (req, res) {
    let id = req.params.id;
    let updateData = {
        name: req.body.name,
        house: req.body.house,
        level: req.body.level
    };

    FantasyCharacter.findByIdAndUpdate(id, updateData, { new: true }, (err, updatedEntry) => {
        if (err) {
            res.status(400).json(err);
        } else {
            res.status(200).json(updatedEntry);
        }
    });
});

//TODO: make a DELETE endpoint  that updates the database given a particular id
//DELETE endpoint to remove a character by ID
app.delete("/api/id/:id", function (req, res) {
    let id = req.params.id;

    FantasyCharacter.findByIdAndDelete(id, (err, deletedEntry) => {
        if (err) {
            res.status(400).json(err);
        } else {
            res.status(200).json(deletedEntry);
        }
    });
});







/////////////////////////////////////////////////////////////////
//   YOU SHOULD NOT NEED TO CHANGE ANYTHING BELOW THIS LINE    //
/////////////////////////////////////////////////////////////////

app.listen(3000);