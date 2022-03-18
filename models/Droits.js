const mongoose = require('./db.js');
const droitSchema = mongoose.Schema({
    _id: Number,
    Description: String
});


module.exports = mongoose.model('Droit', droitSchema, "Droits");