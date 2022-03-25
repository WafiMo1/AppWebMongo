const mongoose = require('./db.js');

const empruntSchema = mongoose.Schema({
    DatePret: String,
    DateRetourPrevu: String,
    DateRetour: String,
    Livre_id: mongoose.Schema.ObjectId,
    Utilisateur_id: mongoose.Schema.ObjectId
});

module.exports = mongoose.model('Emprunt', empruntSchema, "Emprunts");