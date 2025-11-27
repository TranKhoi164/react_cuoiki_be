const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true
    },
    name: { type: String, required: true },
    slug: { type: String, unique: true },
    description: String,
    sku: String,

    // Mảng thuộc tính dạng {"key": "", "value": ""}
    attributes: [
      {
        key: String,
        value: String
      }
    ],

    // Mảng hình ảnh (URL)
    images: [String],

    // Detail dạng object JSON
    detail: {
      type: Map,
      of: String
    },

    rating: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: true
    }
  },
  { timestamps: true });

const Product = mongoose.model("Product", ProductSchema);

module.exports= Product;