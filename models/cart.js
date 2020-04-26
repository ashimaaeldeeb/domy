const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },

    productsList: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Product'
        },
        quantity: {
            type: Number,
            required: true
        },
        isDeleted: {
            type: Boolean,
            required: true
        }
    }]
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;