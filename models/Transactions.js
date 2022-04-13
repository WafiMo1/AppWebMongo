const mongoose = require('./db.js');

const transactionSchema = mongoose.Schema({
    DateTransaction: Date,
    MethodePaiement: String,
    Cout: Number,
    Utilisateur_id: mongoose.Schema.ObjectId,
    EmployeeId: mongoose.Schema.ObjectId,
    Commentaire: String
});

module.exports = mongoose.model('Transaction', transactionSchema, "Transactions");