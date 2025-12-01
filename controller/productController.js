const Product = require("../models/Product");

async function getproduct(req, res) {
  try {
    const { name, minPrice, maxPrice } = req.query;
    const filter = {};

    if (name) {
      filter.name = { $regex: name, $options: "i" };
    }

    const parsedMin = minPrice !== undefined ? Number(minPrice) : undefined;
    const parsedMax = maxPrice !== undefined ? Number(maxPrice) : undefined;
    const hasMin = parsedMin !== undefined && !Number.isNaN(parsedMin);
    const hasMax = parsedMax !== undefined && !Number.isNaN(parsedMax);

    if (hasMin || hasMax) {
      filter.price = {};
      if (hasMin) {
        filter.price.$gte = parsedMin;
      }
      if (hasMax) {
        filter.price.$lte = parsedMax;
      }
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json({
      message: "Products fetched",
      data: products
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch products",
      error: error.message
    });
  }
}

async function getProductbyid(req, res) {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({
      message: "Product fetched",
      data: product
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch product",
      error: error.message
    });
  }
}

async function addProduct(req, res) {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ message: "Created", data: product });
  } catch (error) {
    res.status(400).json({
      message: "Failed to create product",
      error: error.message
    });
  }
}

async function updateProduct(req, res) {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Updated", data: product });
  } catch (error) {
    res.status(400).json({
      message: "Failed to update product",
      error: error.message
    });
  }
}

async function deleteProduct(req, res) {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Deleted" });
  } catch (error) {
    res.status(400).json({
      message: "Failed to delete product",
      error: error.message
    });
  }
}

module.exports = {
  getproduct,
  getProductbyid,
  addProduct,
  updateProduct,
  deleteProduct
};