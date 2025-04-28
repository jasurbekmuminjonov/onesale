const mongoose = require('mongoose');

const ImportSchema = new mongoose.Schema({
    supplierId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Supplier',
        required: true
    },
    products: {
        type: [
            {
                productId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Product',
                    required: true
                },
                quantity: {
                    type: Number,
                    required: true,
                    default: 0
                },
                purchasePrice: {
                    type: Number,
                    required: true,
                    default: 0
                },
                salePriceOptom: {
                    type: Number,
                    required: true,
                    default: 0
                },
                salePrice: {
                    type: Number,
                    required: true,
                    default: 0
                }
            }
        ],
        default: []
    },
    totalAmount: {
        type: Number,
        required: true,
        default: 0
    },
    isDebt:{
        type: Boolean,
        default: false
    },
    paidAmount: {
        type: Number,
        required: true,
        default: 0
    },
    paymentLog: {
        type: [
            {
                paymentMethod: {
                    type: String,
                    required: true,
                    enum: ['cash', 'card']
                },
                amount: {
                    type: Number,
                    required: true
                },
                date: {
                    type: Date,
                    default: Date.now
                }
            }
        ],
        default: []
    },
    storeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store',
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'cancelled'],
        default: 'pending'
    }
});

module.exports = mongoose.model('Import', ImportSchema);