const myModule = require('./myOtherFile.js');

console.log(myModule.name);
myModule.inc();
console.log(myModule.getCounter());
