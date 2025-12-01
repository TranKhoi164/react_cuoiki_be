const mongoose = require("mongoose");

const ImportDetailSchema = new mongoose.Schema({
  importOrderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ImportOrder",
    required: true
  },

  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },

  quantity: {
    type: Number,
    required: true,
    min: 1
  },

  price: {
    type: Number,
    required: true,
    min: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("ImportDetail", ImportDetailSchema);