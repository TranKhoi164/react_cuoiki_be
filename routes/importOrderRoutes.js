const express = require("express");
const importOrderController = require("../controller/importOrderController");
const router = express.Router();

// Bỏ qua authorizeAdmin - ai cũng có thể truy cập
router.post('/', importOrderController.createImportOrder);
router.delete('/:id', importOrderController.deleteImportOrder);
router.get('/', importOrderController.getImportOrders);
router.get('/statistics', importOrderController.getImportStatistics);
router.get('/:id', importOrderController.getImportOrderById);

module.exports = router;