const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  inventory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Inventory',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'beingShipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  payment: {
    type: String,
    enum: ['fined_stamp', 'order'],
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  paymentOffline: {
    type: Boolean,
    default: false
  },
  shippingAddress: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);