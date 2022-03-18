const mongoose = require('mongoose');

//url for mongodb altas
const URL = 'mongodb+srv://admin:admin@cluster0.0b3rg.mongodb.net/Biblio?retryWrites=true&w=majority'

//connect to mongoose
mongoose.connect(URL, async (err) => {
    if (err) throw err;
    console.log('conncted to db')
});

module.exports = mongoose;