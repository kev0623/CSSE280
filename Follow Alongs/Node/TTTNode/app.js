const express = require("express");

var app = express();
app.use(express.static("public"));



app.get("/api/getmove/:board", (request, response) => {
    const boardString = request.params.board;

    const openLocations = getOpenLocations(boardString);

    const moveSelected = openLocations[Math.floor(Math.random() * openLocations.length)]
    console.log(boardString);
    response.send({"move": moveSelected});
});

function getOpenLocations(boardString) {
    const openLocations = [];
    for (var i = 0; i < boardString.length; i++) {
        if (boardString.charAt(i) == '-') {
            openLocations.push(i)
        }
    }
    return openLocations;
}

console.log(getOpenLocations("-OO-OOOOO"));


app.listen(3000);