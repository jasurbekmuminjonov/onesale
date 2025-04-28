const mongoose = require('mongoose');

const SaleSchema = new mongoose.Schema({
    products: {
        type: [
            {
                productId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Product',
                    required: true
                },
                stockDate: {
                    type: Date,
                    required: true
                },
                quantity: {
                    type: Number,
                    required: true
                },
                price: {
                    type: Number,
                    required: true
                }
            }
        ],
        required: true
    },
    totalAmount: {
        type: Number,
        required: true
    },
    paidAmount: {
        type: Number,
        required: true
    },
    isDebt: {
        type: Boolean,
        default: false
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: false,
        default: null
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

module.exports = mongoose.model('Sale', SaleSchema);