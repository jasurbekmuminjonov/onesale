const mongoose = require('mongoose');

const DailySaleSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        default: null
    },
    storeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store',
        required: true
    },
    sales: {
        type: [mongoose.Schema.Types.ObjectId],
        default: [],
        ref: 'Sale',
    },
    date: {
        type: String
    },
    status: {
        type: String,
        enum: ["active", "inactive"]
    }

});

module.exports = mongoose.model('DailySale', DailySaleSchema);