const mongoose = require('mongoose').set('debug', true);

mongoose.Promise = global.Promise;

//setting up a schema to provide structure to our data
const fantasyCharacterSchema = new mongoose.Schema( {
    name: String,
    house: String,
    level: Number
});

const FantasyCharacter = mongoose.model('FantasyCharacter', fantasyCharacterSchema, 'fantasycharacter' );
module.exports = FantasyCharacter;
