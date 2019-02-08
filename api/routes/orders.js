const express = require("express");
const router = express.Router();

const mongoose = require("mongoose");
const Order = require("../models/order");
const Product = require("../models/product");

//GET: ALL ORDERS
router.get("/", (req, res, next) => {
  Order.find()
    .exec()
    .then(result => {
      res.status(200).json(result);
    })
    .catch(err => {
      res.status(500).json({ error: err });
    });
});

//POST: CREATE NEW ORDER
router.post("/", (req, res, next) => {
  Product.findById(req.body.productid)
    .then(product => {
      const order = new Order({
        _id: mongoose.Types.ObjectId(),
        quantity: req.body,
        product: product._id
      });
      order
        .save()
        .exec()
        .then(result => {
          res.status(201).json({ order: result });
        })
        .catch(err => {
          res.status(500).json({ error: err });
        });
    })
    .catch(err => {
      res.status(404).json({ message: "Product not found", error: err });
    });
});

module.exports = router;
