const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema({
    customerName: {
        type: String,
        required: true,
    },
    customerPhone: {
        type: String,
        required: true,
        match: /^\d{9}$/
    },
    storeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store',
        required: true
    }
});

module.exports = mongoose.model('Customer', CustomerSchema);