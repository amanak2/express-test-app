const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");

const Product = require("../models/product");
const checkAuth = require("../middlewares/check-auth");

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function(req, file, cb) {
    cb(null, new Data().toISOString + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 },
  fileFilter: fileFilter
});

//GET: ALL PRODUCTS
router.get("/", (req, res, next) => {
  Product.find()
    .select("name price _id")
    .exec()
    .then(docs => {
      const response = {
        count: docs.length,
        products: docs.map(doc => {
          return {
            name: doc.name,
            price: doc.price,
            id: doc._id,
            img: doc.img,
            request: {
              type: "GET",
              url: "http://localhost:3000/products/" + doc._id
            }
          };
        })
      };
      res.status(200).json(response);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

//GET: PRODUCTS BY ID
router.get("/:id", (req, res, next) => {
  const id = req.params.id;
  Product.findById(id)
    .exec()
    .then(doc => {
      console.log(doc);
      if (doc) {
        res.status(200).json(doc);
      } else {
        res.status(404).json({ message: "No valid endtry found!" });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

//POST: CREATE NEW PRODUCT -> formdata
router.post("/", checkAuth, upload.single("productImg"), (req, res, next) => {
  const product = new Product({
    _id: mongoose.Types.ObjectId(),
    name: req.body.name,
    price: req.body.price,
    img: req.file.path
  });
  product
    .save()
    .then(result => {
      const response = {
        name: result.name,
        price: result.price,
        request: {
          type: "GET",
          url: "http://localhost:3000/products/" + result._id
        }
      };
      res.status(201).json(response);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

//PATCH: UPDATE BY ID
router.patch("/:id", (req, res, next) => {
  const id = req.params.id;
  const updateOps = {};
  for (const ops of req.body) {
    updateOps[ops.propName] = ops.value;
  }
  Product.update({ _id: id }, { $set: updateOps })
    .exec()
    .then(result => {
      res.status(200).json({ message: "procuct updated" });
    })
    .catch(err => {
      res.status(500).json({ error: err });
    });
});

//DELETE: DELETE PRODUCT BY ID
router.delete("/:id", (req, res, next) => {
  const id = req.params.id;
  Product.remove({ _id: id })
    .exec()
    .then(result => {
      res.status(200).json(result);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

module.exports = router;
