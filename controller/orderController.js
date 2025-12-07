const Order = require('../models/Order');
const Product = require('../models/Product');
const Inventory=require('../models/Inventory')
const mongoose = require('mongoose');

// Hàm hỗ trợ để xử lý lỗi
const handleServerError = (res, error) => {
  console.error("Lỗi Server:", error);
  res.status(500).json({ message: 'Lỗi server nội bộ', error: error.message });
};

// [PUBLIC] Lấy DANH SÁCH TẤT CẢ đơn hàng
exports.getOrders = async (req, res) => {
  try {
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
    const { userId } = req.params;

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ message: 'ID người dùng không hợp lệ.' });
    }

    const orders = await Order.find({ account: userId })
      .populate('product', 'name price image')
      .populate('account', 'username email')
      .sort({ createdAt: -1 });

    if (orders.length === 0) {
      return res.status(404).json({ message: `Không tìm thấy đơn hàng nào cho người dùng ${userId}.` });
    }

    res.status(200).json(orders);
  } catch (error) {
    handleServerError(res, error);
  }
};

// [PUBLIC] Lấy chi tiết đơn hàng theo ID (Không phân quyền)
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'ID đơn hàng không hợp lệ.' });
    }

    const order = await Order.findById(id)
      .populate('product', 'name price image')
      .populate('account', 'username email');

    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng.' });
    }

    res.status(200).json(order);
  } catch (error) {
    handleServerError(res, error);
  }
};

// [PUBLIC] Tạo đơn hàng mới (ĐÃ LOẠI BỎ TRANSACTIONS)
exports.createOrder = async (req, res) => {
//   // Đã loại bỏ: const session = await mongoose.startSession();
//   // Đã loại bỏ: session.startTransaction();

//   try {
//     const { product: productId, quantity, paymentOffline = false, shippingAddress, accountId } = req.body;

//     // Kiểm tra đầu vào cơ bản
//     if (!productId || !quantity || !shippingAddress || !accountId || quantity < 1) {
//       return res.status(400).json({ message: 'Dữ liệu đơn hàng không hợp lệ, thiếu accountId hoặc thông tin khác.' });
//     }

//     // 1. Lấy thông tin sản phẩm và kiểm tra tồn kho
//     const product = await Product.findById(productId);

//     if (!product || !product.visible) {
//       return res.status(404).json({ message: 'Sản phẩm không tồn tại hoặc đã bị ẩn.' });
//     }

//     if (product.quantity < quantity) {
//       return res.status(400).json({ message: `Sản phẩm "${product.name}" chỉ còn ${product.quantity} sản phẩm trong kho.` });
//     }

//     // 2. Cập nhật tồn kho (giảm quantity)
//     product.quantity -= quantity;
//     await product.save();

//     // 3. Tạo đơn hàng
//     const newOrder = new Order({
//       product: productId,
//       account: accountId,
//       quantity,
//       paymentOffline,
//       shippingAddress,
//       priceAtOrder: product.price,
//       status: 'pending'
//     });

//     const savedOrder = await newOrder.save();

//     // Đã loại bỏ: await session.commitTransaction();
//     // Đã loại bỏ: session.endSession();

//     res.status(201).json({ message: 'Đơn hàng được tạo thành công!', order: savedOrder });

//   } catch (error) {
//     // Đã loại bỏ: await session.abortTransaction();
//     // Đã loại bỏ: session.endSession();
//     handleServerError(res, error);
//   }

  try {
    console.log('=== BACKEND createOrder ===');
    console.log('Headers:', req.headers);
    console.log('Full request body:', JSON.stringify(req.body));
    console.log('Status in body:', req.body.status);
    console.log('Type of status:', typeof req.body.status);
    
    const { 
      product: productId, 
      quantity, 
      paymentOffline = false, 
      shippingAddress, 
      accountId, 
      status = 'pending' // Mặc định là pending
    } = req.body;

    // Kiểm tra đầu vào cơ bản
    if (!productId || !quantity || !shippingAddress || !accountId || quantity < 1) {
      return res.status(400).json({ message: 'Dữ liệu đơn hàng không hợp lệ.' });
    }

    // 1. Lấy thông tin sản phẩm
    const product = await Product.findById(productId);

    if (!product || !product.visible) {
      return res.status(404).json({ message: 'Sản phẩm không tồn tại hoặc đã bị ẩn.' });
    }

    // 2. Nếu là thêm vào giỏ hàng (inCart) - KHÔNG kiểm tra tồn kho
    // Nếu là mua ngay (pending) - kiểm tra tồn kho và trừ số lượng
    if (status === 'pending') {
      if (product.quantity < quantity) {
        return res.status(400).json({ 
          message: `Sản phẩm "${product.name}" chỉ còn ${product.quantity} sản phẩm trong kho.` 
        });
      }
      
      // 1. Trừ số lượng từ product
      product.quantity -= quantity;
      await product.save();
      
      // 2. Trừ số lượng từ inventory (nếu có)
      const inventory = await Inventory.findOne({ product: productId });
      if (inventory) {
        inventory.quantity = Math.max(0, inventory.quantity - quantity);
        await inventory.save();
        console.log(`✅ Đã cập nhật inventory: ${inventory._id}, số lượng mới: ${inventory.quantity}`);
      }
    }
    // Nếu là inCart - KHÔNG trừ tồn kho (chỉ khi thanh toán mới trừ)

    // 3. Tạo đơn hàng với status từ request
    const newOrder = new Order({
      product: productId,
      account: accountId,
      quantity,
      paymentOffline,
      shippingAddress,
      priceAtOrder: product.price,
      status: status  // Sử dụng status từ request
    });

    const savedOrder = await newOrder.save();

    // Populate thông tin để trả về đầy đủ
    const populatedOrder = await Order.findById(savedOrder._id)
      .populate('product', 'name price image')
      .populate('account', 'username email');

    res.status(201).json({ 
      message: status === 'inCart' 
        ? 'Đã thêm vào giỏ hàng!' 
        : 'Đơn hàng được tạo thành công!', 
      order: populatedOrder 
    });

  } catch (error) {
    handleServerError(res, error);
  }
};

// [PUBLIC] Hủy đơn hàng (ĐÃ LOẠI BỎ TRANSACTIONS)
exports.cancelOrder = async (req, res) => {
  // Đã loại bỏ: const session = await mongoose.startSession();
  // Đã loại bỏ: session.startTransaction();

  try {
    const { id } = req.params;
    const { accountId } = req.body;

    if (!accountId || !mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Thiếu accountId hoặc ID đơn hàng không hợp lệ.' });
    }

    // Tìm đơn hàng theo ID và accountId
    const order = await Order.findOne({ _id: id, account: accountId });

    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng này hoặc accountId không khớp.' });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ message: `Đơn hàng ở trạng thái "${order.status}". Chỉ đơn hàng đang chờ xử lý mới có thể hủy.` });
    }

    // 1. Cập nhật trạng thái đơn hàng
    order.status = 'cancelled';
    const cancelledOrder = await order.save();

    // 2. Hoàn lại số lượng vào kho sản phẩm
    const product = await Product.findById(order.product);
    if (product) {
      product.quantity += order.quantity;
      await product.save();
    }

    const inventory = await Inventory.findOne({ product: order.product });
    if (inventory) {
      inventory.quantity += order.quantity;
      await inventory.save();
      console.log(`✅ Đã hoàn trả inventory: ${inventory._id}, số lượng mới: ${inventory.quantity}`);
    }

    // Đã loại bỏ: await session.commitTransaction();
    // Đã loại bỏ: session.endSession();

    res.status(200).json({ message: 'Đơn hàng đã được hủy thành công và hoàn lại tồn kho.', order: cancelledOrder });

  } catch (error) {
    // Đã loại bỏ: await session.abortTransaction();
    // Đã loại bỏ: session.endSession();
    handleServerError(res, error);
  }
};

// [PUBLIC] Cập nhật trạng thái đơn hàng (Không có kiểm tra Admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    console.log(req.params)

    console.log(req.body)


    const validStatuses = ['pending', 'beingShipped', 'delivered', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Trạng thái không hợp lệ.' });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng.' });
    }

    if (status === 'pending' && order.status === 'inCart') {
      // Trừ tồn kho khi chuyển từ giỏ hàng sang pending
      const product = await Product.findById(order.product);
      if (product) {
        if (product.quantity < order.quantity) {
          return res.status(400).json({ 
            message: `Sản phẩm "${product.name}" chỉ còn ${product.quantity} sản phẩm trong kho.` 
          });
        }
        product.quantity -= order.quantity;
        await product.save();
      }
    }

    order.status = status;
    const updatedOrder = await order.save();

    res.status(200).json({ message: 'Cập nhật trạng thái đơn hàng thành công.', order: updatedOrder });
  } catch (error) {
    handleServerError(res, error);
  }
};