const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    productName: {
        type: String,
        required: true,
        trim: true
    },
    barcode: {
        type: String,
        required: true,
        trim: true
    },
    unitMeasure: {
        type: String,
        required: true,
        trim: true
    },
    stock: {
        type: [
            {
                quantity: {
                    type: Number,
                    required: true
                },
                date: {
                    type: Date,
                    default: Date.now
                },
                purchasePrice: {
                    type: Number,
                    required: true,
                    default: 0
                },
                salePrice: {
                    type: Number,
                    required: true,
                    default: 0
                },
                totalSold: {
                    type: Number,
                    required: true,
                    default: 0
                },
                salePriceOptom: {
                    type: Number,
                    required: true,
                    default: 0
                },
            }
        ],
        default: []
    },
    purchasePrice: {
        type: Number,
        required: true,
        default: 0
    },
    salePrice: {
        type: Number,
        required: true,
        default: 0
    },
    salePriceOptom: {
        type: Number,
        required: true,
        default: 0
    },
    storeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store',
        required: true
    }
});

module.exports = mongoose.model('Product', ProductSchema);