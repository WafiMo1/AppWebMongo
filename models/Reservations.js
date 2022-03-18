const mongoose = require('./db.js');

const reservationSchema = mongoose.Schema({
    DateReservation: Date,
    Livre_id: mongoose.Schema.ObjectId,
    Utilisateur_id: mongoose.Schema.ObjectId
});

module.exports = mongoose.model('Reservation', reservationSchema, "Reservations");