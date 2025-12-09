const Order = require('../models/Order');
const Product = require('../models/Product');
const Inventory=require('../models/Inventory');
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
  try {
    console.log('=== BACKEND createOrder ===');
    console.log('Full request body:', JSON.stringify(req.body));
    
    const { 
      product: productId, 
      quantity, 
      paymentOffline = false, 
      shippingAddress, 
      accountId, 
      status = 'pending'
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

    // 2. Nếu là thêm vào giỏ hàng (inCart) - KHÔNG kiểm tra và trừ tồn kho
    // Nếu là mua ngay (pending) - kiểm tra và trừ tồn kho CẢ product và inventory
    if (status === 'pending') {
      // Kiểm tra tồn kho sản phẩm
      if (product.quantity < quantity) {
        return res.status(400).json({ 
          message: `Sản phẩm "${product.name}" chỉ còn ${product.quantity} sản phẩm trong kho.` 
        });
      }
      
      // Trừ tồn kho từ Product
      product.quantity -= quantity;
      await product.save();
      console.log(`✅ Đã trừ ${quantity} từ product ${product.name}, còn lại: ${product.quantity}`);
      
      // Trừ tồn kho từ Inventory
      const inventory = await Inventory.findOne({ product: productId });
      if (inventory) {
        // Kiểm tra inventory quantity
        if (inventory.quantity < quantity) {
          // Rollback product quantity nếu inventory không đủ
          product.quantity += quantity;
          await product.save();
          return res.status(400).json({ 
            message: `Tồn kho thực tế chỉ còn ${inventory.quantity} sản phẩm.` 
          });
        }
        
        inventory.quantity -= quantity;
        await inventory.save();
        console.log(`✅ Đã trừ ${quantity} từ inventory, còn lại: ${inventory.quantity}`);
      } else {
        console.log(`⚠️ Không tìm thấy inventory cho sản phẩm ${productId}`);
        // Vẫn cho phép tạo đơn hàng nếu không có inventory
      }
    }
    // Nếu là inCart - KHÔNG trừ tồn kho

    // 3. Tạo đơn hàng với status từ request
    const newOrder = new Order({
      product: productId,
      account: accountId,
      quantity,
      paymentOffline,
      shippingAddress,
      priceAtOrder: product.price,
      status: status
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
    console.error('❌ Lỗi tạo đơn hàng:', error);
    res.status(500).json({
      message: 'Lỗi server nội bộ',
      error: error.message
    });
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

    // 2. Hoàn lại số lượng vào kho sản phẩm (Product)
    const product = await Product.findById(order.product);
    if (product) {
      product.quantity += order.quantity;
      await product.save();
      console.log(`✅ Đã hoàn trả ${order.quantity} vào product ${product.name}`);
    }

    // 3. Hoàn lại số lượng vào kho (Inventory)
    const inventory = await Inventory.findOne({ product: order.product });
    if (inventory) {
      inventory.quantity += order.quantity;
      await inventory.save();
      console.log(`✅ Đã hoàn trả ${order.quantity} vào inventory`);
    }

    res.status(200).json({ 
      message: 'Đơn hàng đã được hủy thành công và hoàn lại tồn kho.', 
      order: cancelledOrder 
    });

  } catch (error) {
    console.error('❌ Lỗi hủy đơn hàng:', error);
    res.status(500).json({
      message: 'Lỗi server nội bộ',
      error: error.message
    });
  }
};

// [PUBLIC] Cập nhật trạng thái đơn hàng (Không có kiểm tra Admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['inCart','pending', 'beingShipped', 'delivered', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Trạng thái không hợp lệ.' });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng.' });
    }

    // Nếu chuyển từ giỏ hàng sang pending
    if (status === 'pending' && order.status === 'inCart') {
      const product = await Product.findById(order.product);
      if (product) {
        // Kiểm tra tồn kho product
        if (product.quantity < order.quantity) {
          return res.status(400).json({ 
            message: `Sản phẩm "${product.name}" chỉ còn ${product.quantity} sản phẩm trong kho.` 
          });
        }
        
        // Trừ tồn kho từ Product
        product.quantity -= order.quantity;
        await product.save();
        
        // Trừ tồn kho từ Inventory
        const inventory = await Inventory.findOne({ product: order.product });
        if (inventory) {
          // Kiểm tra inventory quantity
          if (inventory.quantity < order.quantity) {
            // Rollback product quantity
            product.quantity += order.quantity;
            await product.save();
            return res.status(400).json({ 
              message: `Tồn kho thực tế chỉ còn ${inventory.quantity} sản phẩm.` 
            });
          }
          
          inventory.quantity -= order.quantity;
          await inventory.save();
        }
      }
    }
    // Nếu hủy đơn hàng pending
    else if (status === 'cancelled' && order.status === 'pending') {
      const product = await Product.findById(order.product);
      if (product) {
        product.quantity += order.quantity;
        await product.save();
      }
      
      const inventory = await Inventory.findOne({ product: order.product });
      if (inventory) {
        inventory.quantity += order.quantity;
        await inventory.save();
      }
    }

    order.status = status;
    const updatedOrder = await order.save();

    res.status(200).json({ 
      message: 'Cập nhật trạng thái đơn hàng thành công.', 
      order: updatedOrder 
    });
  } catch (error) {
    console.error('❌ Lỗi cập nhật trạng thái:', error);
    res.status(500).json({
      message: 'Lỗi server nội bộ',
      error: error.message
    });
  }
};