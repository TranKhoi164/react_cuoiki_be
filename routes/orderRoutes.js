const express = require('express');
const router = express.Router();
const orderController = require('../controller/orderController');
// Đã loại bỏ hoàn toàn các middleware bảo mật theo yêu cầu
// const { authMiddleware, adminMiddleware } = require('../middlewares/auth.middleware'); 

// Tuyến đường đã được mở công khai

// GET /api/orders
// Lấy tất cả đơn hàng (controller cần xử lý logic phân quyền nếu cần)
router.get('/', orderController.getOrders);

// POST /api/orders
// Tạo đơn hàng mới.
// Controller phải lấy account ID từ req.body hoặc req.params.
router.post('/', orderController.createOrder);

// GET /api/orders/user/:userId
// Lấy tất cả đơn hàng của một userId cụ thể được truyền qua params.
router.get('/user/:userId', orderController.getOrdersByUserId);

// GET /api/orders/:id
// Lấy chi tiết đơn hàng theo ID.
router.get('/:id', orderController.getOrderById);

// PATCH /api/orders/:id/cancel
// Hủy đơn hàng (chỉ khi trạng thái là pending).
// Controller phải kiểm tra người dùng có quyền hủy đơn hàng này.
router.patch('/:id/cancel', orderController.cancelOrder);

// Tuyến đường Cập nhật trạng thái

// PATCH /api/orders/:id/status
// Cập nhật trạng thái đơn hàng.
// Controller phải tự kiểm tra quyền Admin.
router.patch('/:id/status', orderController.updateOrderStatus);


module.exports = router;

// Hướng dẫn sử dụng:
// 1. Import router này vào file Express app chính của bạn (ví dụ: app.js).
// 2. Sử dụng app.use('/api/orders', orderRoutes);