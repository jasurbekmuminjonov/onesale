const mongoose = require('mongoose');

const ReturnedProductSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    stockDate: {
        type: Date,
        required: true
    },
    saleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sale',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        default: 1
    },
    reason: {
        type: String,
        required: false,
        trim: true,
        default: '-'
    },
    date: {
        type: Date,
        default: Date.now
    },
    storeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store',
        required: true
    }
});

module.exports = mongoose.model('ReturnedProduct', ReturnedProductSchema);