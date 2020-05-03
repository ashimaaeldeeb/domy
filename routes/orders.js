const express = require("express");
const User = require("../models/user");
const Product = require("../models/product");
const Order = require("../models/order");
const Cart = require("../models/cart");
const validateOrder = require("../helpers/ValidateOrder");
const CheckToken = require("../midlware/Auth");
const validateObjectId = require("../helpers/ValidateObjectId");
const router = express.Router();

//view admin orders
router.get("/", async (req, res) => {
  const orders = await Order.find({});
  if (!orders) return res.status(404).send("No orders found");
  res.send(orders);
});

//view user orders
router.get("/user/:id", CheckToken, async (req, res) => {
  const id = req.params.id;
  const { error } = validateObjectId(id);
  if (error) {
    return res.status(400).send("Invalid ID");
  }
  const orders = await Order.find({
    user: id
  });
  if (!orders) {
    return res.status(400).send("No orders found");
  }
  res.send(orders);
});

//make order
router.post("/", CheckToken, async (req, res) => {
  const id = req.body.user;
  const { error } = validateObjectId(id);
  if (error) {
    return res.status(400).send(error.details);
  }
  const user = await User.findOne({
    _id: id
  });
  if (!user) return res.status(404).send("user not found");
  const cart = await Cart.findById(user.cart);
  if (!cart.productsList.length) return res.status(400).send("cart is empty");
  // let productsToBeOrdered = [];
  var totalPrice = 0;
  let order = new Order({
    user: req.body.user,
    date: Date.now(),
    price: 0,
    products: [],
    status: "pending"
  });
  cart.productsList.forEach(async element => {
    // if (!element.isDeleted) {
    order.products.push({
      product: element.productId,
      quantity: element.quantity
    });
    const product = await Product.findById(element.productId);
    console.log("product");
    console.log(product);
    // {{item.product.price - item.product.price * item.product.ratioOfPromotion}} EGP
    if (product.isPromoted) {
      totalPrice +=
        (product.price - product.price * product.ratioOfPromotion) *
        element.quantity;
    } else {
      totalPrice += product.price * element.quantity;
    }
    console.log("totalPrice");
    console.log(totalPrice);
    order.price = totalPrice;
    console.log("order");
    console.log(order);

    // }
  });
  // order.products = productsToBeOrdered;
  await order.save();
  console.log("order2");
  console.log(order);
  user.orders.push(order.id);
  await user.save();
  cart.productsList = [];
  console.log("CARRT", cart.productsList);
  await cart.save();
  return res.send(order);
});

//update state only: accepted (decrease quantity from product) - rejected

router.patch("/:id", CheckToken, async (req, res) => {
  const id = req.params.id;
  const { error } = validateObjectId(id);
  if (error) {
    return res.status(400).send("Invalid ID");
  }
  const order = await Order.findById(id);
  if (!order) return res.status(404).send("Order Not Found");

  const status = req.body.status;
  //update
  if (
    (order.status === "pending" &&
    (status === "accepted" || status === "rejected") ) || (status === "cancelled")
  ) {
    order.status = status;
    order.products.forEach(async element => {
      const product = await Product.findById(element.product);
      if (product.quantity < element.quantity) {
        return res.status(400).send(`run out of stock product ${element}`);
      }
      if (status === "rejected" || status === "cancelled") {
        //plus qty if rejected
        product.quantity += element.quantity;
      }
      await product.save();
    });
  }
  order.save();
  return res.send(order);

  //   if (
  //     order.status === "pending" &&
  //     (status === "accepted" || status === "rejected")
  //   ) {
  //     order.status = status;
  //     order.products.forEach(async element => {
  //       const product = await Product.findById(element.productId);
  //       if (product.quantity < element.quantity) {
  //         return res.status(400).send(`run out of stock product ${element}`);
  //       }
  //       console.log("before in patch order", product.quantity);

  //       product.quantity -= element.quantity;
  //       console.log("after in patch order",product.quantity);
  //       if (product.quantity < 0) {
  //         product.quantity = 0;
  //       }
  //       await product.save();
  //     });
  //   }
});

//cancel order if pending:
router.delete("/:id", CheckToken, async (req, res) => {
  const id = req.params.id;
  const { error } = validateObjectId(id);
  if (error) {
    return res.status(400).send("Invalid ID");
  }
  oldOrder = await Order.findById(id);
  if (!oldOrder) {
    return res.status(400).send("Order not found");
  }
  if (oldOrder.status == "pending") {
    const deletedOrder = await Order.findByIdAndUpdate(
      id,
      {
        status: "cancelled"
      },
      {
        new: true
      }
    );
    res.send(deletedOrder);
  } else {
    return res
      .status(400)
      .send(
        "Cannot cancel order. Orders can be cancelled only if they are pending."
      );
  }
});

module.exports = router;
