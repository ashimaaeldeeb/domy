const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    images: [{
        type: String,
        //required: true
    }],
    price: {
        type: Number,
        required: true
    },
    details: {
        brand: {
            type: String
        },
        processor: {
            type: String
        },
        ram: {
            type: String
        },
        hardDisk: {
            type: String
        },
        graphicsCard: {
            type: String
        },
        color: {
            type: String
        }
    },
    ratioOfPromotion: {
        type: Number
    },
    isPromoted: {
        type: Boolean
    },
    quantity: {
        type: Number,
        required: true
    },
    isDeleted: {
        type: Boolean
    }
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;