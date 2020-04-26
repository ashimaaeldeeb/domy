const express = require("express");
const Cart = require("../models/cart");
const User = require("../models/user");
const Product = require('../models/product');
const CheckToken = require('../midlware/Auth');
const validateObjectId = require("../helpers/validateObjectId");

const router = express.Router();

//Get User's Cart
router.get("/user/:id", CheckToken, async (req, res) => {

    const id = req.params.id;
    const {
        error
    } = validateObjectId(req.params.id);
    if (error) return res.status(400).send("User id is not valid");
    const cart = await Cart.find({
        userId: id
    });
    console.log(cart);
    if (!cart) return res.status(404).send("Cart is not found for this user.");
    res.status(200).send(cart);
});

//Post product to user's cart
router.post("/user/:id", CheckToken, async (req, res) => {
    const {
        error
    } = validateObjectId(req.params.id);
    if (error) return res.status(400).send("User id is not valid");

    const user = await User.findById(req.params.id);
    if (!user) return res.status(400).send("User is not found");

    const cart = await Cart.findOne({
        userId: req.params.id
    })
    const productInCart = {
        productId: req.body.productId,
        quantity: req.body.quantity,
        isDeleted: false
    }
    let productExist = false;
    let totalQuantity = productInCart.quantity;
    cart.productsList.forEach(element => {
        if (element.productId == productInCart.productId) {
            productExist = true;
            element.quantity = parseInt(element.quantity) + parseInt(productInCart.quantity);
            totalQuantity = element.quantity;
        }
    });
    if (!productExist) {
        cart.productsList.push(productInCart);
    }
    const productInStore = await Product.findById(productInCart.productId);
    if (parseInt(totalQuantity) > parseInt(productInStore.quantity))
        return res.status(400).send("more than available quantity");
    await cart.save();
    return res.status(200).send(cart);
});

//Patch user's cart
router.patch("/user/:id/product", CheckToken, async (req, res) => {
    const id = req.params.id;
    const {
        error
    } = validateObjectId(id);
    if (error)
        return res.status(400).send("User id is not valid");
    const user = await User.findById(id);
    if (!user)
        return res.status(404).send("User is not found");

    const cart = await Cart.findOne({
        userId: id
    });
    if (!cart) return res.status(400).send("User's cart is not found");
    const productModified = {
        productId: req.body.productId,
        quantity: req.body.quantity,
        isDeleted: req.body.isDeleted
    }
    const productInStore = await Product.findById(productModified.productId);
    if (productModified.quantity && productModified.quantity > productInStore.quantity)
        return res.status(400).send("more than available quantity");

    cart.productsList.forEach(element => {
        if (element.productId == productModified.productId) {
            element.quantity = productModified.quantity ? productModified.quantity : element.quantity;
            element.isDeleted = productModified.isDeleted ? productModified.isDeleted : element.isDeleted;
        }
    });

    await cart.save();
    res.status(200).send(cart);
});
module.exports = router;