const mongoose = require('./db.js');

const utilisateurSchema =  new mongoose.Schema({
    Nom: String,
    Prenom: String,
    Telephone: {type: String, unique: true},
    Email: {type: String, unique: true},
    Password: {
        type: String, set(val) {
            return require('bcrypt').hashSync(val, 10)
        }
    },
    Photo: String,
    MaxPret: Number,
    NbPret: Number,
    Droit_id: mongoose.Schema.ObjectId   
})

module.exports = mongoose.model('Utilisateur', utilisateurSchema, 'Utilisateurs');
