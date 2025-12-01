const express = require("express");
const router = express.Router();
const inventoryController = require("../controller/inventoryController");

// Bỏ qua authorizeAdmin - ai cũng có thể truy cập
router.get("/", inventoryController.getAllInventory);
router.get("/:id", inventoryController.getInventoryById);
router.post("/", inventoryController.createInventory);
router.put("/:id", inventoryController.updateInventory);
router.delete("/:id", inventoryController.deleteInventory);

module.exports = router;