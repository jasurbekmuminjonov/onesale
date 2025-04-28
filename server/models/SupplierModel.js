const mongoose = require('mongoose');

const SupplierSchema = new mongoose.Schema({
    supplierName: {
        type: String,
        required: true,
    },
    supplierPhone: {
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

module.exports = mongoose.model('Supplier', SupplierSchema);