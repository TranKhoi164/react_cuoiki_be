const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  // sku: {
  //   type: String,
  //   required: true,
  //   unique: true,
  //   trim: true
  // },
  // attribute: {
  //   type: Map,
  //   of: String,
  //   default: {}
  // },
  // stock: {
  //   type: Number,
  //   required: true,
  //   min: 0
  // },
  quantity: {
    type: Number,
    default: 0,
    min: 0
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  image: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Inventory', inventorySchema);