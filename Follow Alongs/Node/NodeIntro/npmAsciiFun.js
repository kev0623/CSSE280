console.log("TODO: learn to use npm!");
var figlet = require("figlet");

figlet("I love you !!", function (err, data) {
  if (err) {
    console.log("Something went wrong...");
    console.dir(err);
    return;
  }
  console.log(data);
});