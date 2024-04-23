const http = require('http');

let abcTracker = 0;
let totalTracker = 0;
const _ = require("underscore");
const abcHandler = (request, response) => {
    response.write('<h1>ABC</h1>');
};

const xyzHandler = (request, response) => {
    response.write("<!doctype html>\n");
    response.write("<html>\n<head>\n");
    response.write("<title>Dice Roller</title>\n");
    response.write("</head>\n");
    response.write("<body>\n");
    response.write('<h1>Hello World!</h1>');
    response.write('<div>abcTracker = ' + abcTracker + '</div>');
    response.write('<div>totalTracker = ' + totalTracker + '</div>');
    for(let i=0;i<5;i++){
        let randNum = _.random(1,6);
        response.write('<p>' + randNum +'</p>')
    }



    response.write("\n</body>\n</html>");
};

const faviconHandler = (request, response) => {
    response.writeHead(204, {'Content-Type': 'image/x-icon'});
    response.end();
};

const mainHandler = (request, response) => {
    console.log(request.url);

    // Check for favicon request first and handle it
    if (request.url === "/favicon.ico") {
        faviconHandler(request, response);
        return; // Stop further processing to avoid headers sent error
    }

    // Set headers at the beginning of the response handling
    response.statusCode = 200;
    response.setHeader('Content-Type', 'text/html');
    // Route handling
    if (request.url === "/abc") {
        abcTracker++;
        abcHandler(request, response);
    } else if (request.url.startsWith('/xyz')) {
        xyzHandler(request, response);
    } else {
        // Handle unknown routes
        response.write('<h1>404 Not Found</h1>');
    }
    totalTracker++;
    response.end(); // End the response here to ensure no further writes occur
};

const server = http.createServer(mainHandler);
server.listen(3000, (err) => {
    if (err) {
        console.log("Error", err);
    } else {
        console.log("Listening on port 3000");
    }
});
