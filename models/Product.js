const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  // category: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "Category",
  //   required: true
  // },
  // sku: String,

  // Mảng thuộc tính dạng {"key": "", "value": ""}
  // attributes: [
  //   {
  //     key: String,
  //     value: String
  //   }
  // ],

  // Mảng hình ảnh (URL)
  // images: [String],
  name: { type: String, required: true },
  description: String,
  image: String,
  visible: { type: Boolean, default: true },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    default: 0,
  }
},
  { timestamps: true });

const Product = mongoose.model("Product", ProductSchema);

module.exports = Product;