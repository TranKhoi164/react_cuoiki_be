const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  // Tham chiếu đến sản phẩm
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  // Tham chiếu đến người dùng đặt hàng
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: true,
  },
  // Trạng thái đơn hàng
  status: {
    type: String,
    enum: ['inCart', 'pending', 'beingShipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  // Số lượng sản phẩm đặt hàng
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  // Phương thức thanh toán (true: Thanh toán khi nhận hàng/Offline, false: Thanh toán Online)
  paymentOffline: {
    type: Boolean,
    default: false
  },
  // Địa chỉ giao hàng
  shippingAddress: {
    type: String,
    required: true
  },
  // Lưu trữ giá tại thời điểm đặt hàng (Nên thêm để tránh trường hợp giá sản phẩm thay đổi sau này)
  priceAtOrder: {
    type: Number,
    required: true
  }
}, {
  timestamps: true // Thêm createdAt và updatedAt
});

module.exports = mongoose.model('Order', orderSchema);