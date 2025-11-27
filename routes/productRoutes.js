const express = require("express");
const Product = require("../models/Product");
const productController= require("../controller/productController")
const router = express.Router();

router.get("/", productController.getproduct);

router.get("/:id", productController.getProductbyid);

router.post("/", productController.addProduct);

router.put("/:id", productController.updateProduct);

router.delete("/:id", productController.deleteProduct);

module.exports=router

