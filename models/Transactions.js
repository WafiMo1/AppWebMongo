const mongoose = require('./db.js');

const transactionSchema = mongoose.Schema({
    DateFacturation: Date,
    DatePaiement: Date,
    MethodePaiement: String,
    Cout: Number,
    Utilisateur_id: mongoose.Schema.ObjectId,
    EmployeeId: mongoose.Schema.ObjectId,
    Commentaire: String
});

module.exports = mongoose.model('Transaction', transactionSchema, "Transactions");