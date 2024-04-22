console.log("TODO: learn to use npm!");
var figlet = require("figlet");

// figlet("I love you !!", function (err, data) {
//   if (err) {
//     console.log("Something went wrong...");
//     console.dir(err);
//     return;
//   }
//   console.log(data);
// });
const imgToAscii = require('ascii-img-canvas-nodejs')

const opts = {}

const asciiImgLocal = imgToAscii('files/885px-Node.js_logo.svg.png', opts);
asciiImgLocal.then(ascii => console.log(ascii))
console.log(asciiImgLocal)

