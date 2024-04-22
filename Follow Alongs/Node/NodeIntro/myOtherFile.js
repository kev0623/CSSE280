name = "Kai Chun";


let counter = 0;
inc = () => { counter++;};
dec = ()=>  { counter--;};
getCounter = () => { return counter;};

module.exports = {
    inc,
    dec,
    getCounter,
    name
};