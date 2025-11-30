const Order = require('../models/Order');
const Product = require('../models/Product');
const mongoose = require('mongoose');

// Hàm hỗ trợ để xử lý lỗi
const handleServerError = (res, error) => {
  console.error("Lỗi Server:", error);
  res.status(500).json({ message: 'Lỗi server nội bộ', error: error.message });
};

// [PUBLIC] Lấy DANH SÁCH TẤT CẢ đơn hàng (Không phân quyền)
exports.getOrders = async (req, res) => {
  try {
    // Trả về TẤT CẢ đơn hàng.
    const orders = await Order.find({})
      .populate('product', 'name price image')
      .populate('account', 'username email')
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    handleServerError(res, error);
  }
};

// [PUBLIC] Lấy đơn hàng theo UserId từ Params
exports.getOrdersByUserId = async (req, res) => {
  try {
    const { userId } = req.params; // Lấy userId từ URL params

    // 1. Lọc đơn hàng theo userId
    const orders = await Order.find({ account: userId })
      .populate('product', 'name price image')
      .populate('account', 'username email')
      .sort({ createdAt: -1 });

    if (orders.length === 0) {
      return res.status(404).json({ message: `Không tìm thấy đơn hàng nào cho người dùng ${userId}.` });
    }

    res.status(200).json(orders);
  } catch (error) {
    // Xử lý lỗi nếu userId không phải là ObjectId hợp lệ
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'ID người dùng không hợp lệ.' });
    }
    handleServerError(res, error);
  }
};


// [PUBLIC] Lấy chi tiết đơn hàng theo ID (Không phân quyền)
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id)
      .populate('product', 'name price image')
      .populate('account', 'username email');

    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng.' });
    }

    // Đã loại bỏ kiểm tra quyền sở hữu/Admin.

    res.status(200).json(order);
  } catch (error) {
    handleServerError(res, error);
  }
};

// [PUBLIC] Tạo đơn hàng mới (Cần accountId trong body)
exports.createOrder = async (req, res) => {
  // Bắt đầu transaction để đảm bảo tính toàn vẹn dữ liệu
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // BẮT BUỘC có accountId trong body
    const { product: productId, quantity, paymentOffline = false, shippingAddress, accountId } = req.body;

    if (!productId || !quantity || !shippingAddress || !accountId || quantity < 1) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Dữ liệu đơn hàng không hợp lệ, thiếu accountId hoặc thông tin khác.' });
    }

    // 1. Lấy thông tin sản phẩm và kiểm tra tồn kho
    const product = await Product.findById(productId).session(session);

    if (!product || !product.visible) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Sản phẩm không tồn tại hoặc đã bị ẩn.' });
    }

    if (product.quantity < quantity) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: `Sản phẩm "${product.name}" chỉ còn ${product.quantity} sản phẩm trong kho.` });
    }

    // 2. Cập nhật tồn kho (giảm quantity)
    product.quantity -= quantity;
    await product.save({ session });

    // 3. Tạo đơn hàng
    const newOrder = new Order({
      product: productId,
      account: accountId, // Lấy accountId từ body
      quantity,
      paymentOffline,
      shippingAddress,
      priceAtOrder: product.price,
      status: 'pending'
    });

    const savedOrder = await newOrder.save({ session });

    // 4. Kết thúc transaction
    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ message: 'Đơn hàng được tạo thành công!', order: savedOrder });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    handleServerError(res, error);
  }
};


// [PUBLIC] Hủy đơn hàng (Cần accountId trong body để xác nhận chủ sở hữu)
exports.cancelOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    // BẮT BUỘC có accountId trong body để xác định người hủy
    const { accountId } = req.body;

    if (!accountId) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Thiếu accountId trong body để xác nhận người hủy.' });
    }

    // Tìm đơn hàng theo ID và accountId
    const order = await Order.findOne({ _id: id, account: accountId }).session(session);

    if (!order) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng này hoặc accountId không khớp.' });
    }

    if (order.status !== 'pending') {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: `Đơn hàng ở trạng thái "${order.status}". Chỉ đơn hàng đang chờ xử lý mới có thể hủy.` });
    }

    // 1. Cập nhật trạng thái đơn hàng
    order.status = 'cancelled';
    const cancelledOrder = await order.save({ session });

    // 2. Hoàn lại số lượng vào kho sản phẩm
    const product = await Product.findById(order.product).session(session);
    if (product) {
      product.quantity += order.quantity;
      await product.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ message: 'Đơn hàng đã được hủy thành công và hoàn lại tồn kho.', order: cancelledOrder });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    handleServerError(res, error);
  }
};

// [PUBLIC] Cập nhật trạng thái đơn hàng (Không có kiểm tra Admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Đã loại bỏ kiểm tra Admin. Bất kỳ ai cũng có thể cập nhật.

    const validStatuses = ['pending', 'beingShipped', 'delivered', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Trạng thái không hợp lệ.' });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng.' });
    }

    order.status = status;
    const updatedOrder = await order.save();

    res.status(200).json({ message: 'Cập nhật trạng thái đơn hàng thành công.', order: updatedOrder });
  } catch (error) {
    handleServerError(res, error);
  }
};