const mongoose = require('./db.js');
const SchemaTransactions = mongoose.Schema({
    DateFacturation: Date,
    DatePaiement: Date,
    MethodePaiement: String,
    Cout: Number,
    Utilisateur_id: mongoose.Schema.ObjetId,
    EmployeeId: mongoose.Schema.ObjetId,
    Commentaire: String,
});

module.exports = mongoose.model('Transaction', SchemaTransactions, "Transactions");