const mongoose = require('./db.js');
const livreSchema = mongoose.Schema({
    Auteur: String,
    Titre: String,
    DateParution: String,
    NbCopies: Number,
    NbDisponible: Number,
    MaisonEdition: String,
    ISBN: {type: String, unique: true},
    Cout: Number,
    Description: String,
    Photo: String
});

module.exports = mongoose.model('Livre', livreSchema, "Livres");