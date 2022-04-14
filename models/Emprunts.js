const mongoose = require('./db.js');

const empruntSchema = mongoose.Schema({
    DatePret: Date,
    DateRetourPrevu: Date,
    DateRetour: Date,
    Livre_id: mongoose.Schema.ObjectId,
    Utilisateur_id: mongoose.Schema.ObjectId,
    EstPerdu: Boolean
});

module.exports = mongoose.model('Emprunt', empruntSchema, "Emprunts");