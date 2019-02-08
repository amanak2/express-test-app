const express = require("express");
const app = express();
const morgan = require("morgan");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const products = require("./api/routes/products");
const orders = require("./api/routes/orders");
const users = require("./api/routes/users");

mongoose.connect("mongodb://localhost:27017/express-test2", {
  useNewUrlParser: true
});

//MIDDLE WARE
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use("/uploads", express.static("uploads"));

//SECUIRITY (HEADERS)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Request-With, Content-Type, Accept, Autherization"
  );

  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, GET, PATCH, DELETE, POST");
    return res.status(200).json({});
  }
  next();
});

//ROUTES
app.use("/products", products);
app.use("/orders", orders);
app.use("./users", users);

//ERROR
app.use((req, res, next) => {
  const error = new Error("Not Found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message
    }
  });
});

module.exports = app;
