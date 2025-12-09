const Inventory = require("../models/Inventory");
const Product = require("../models/Product");

const inventoryController = {
  // Lấy tất cả inventory
  getAllInventory: async (req, res) => {
    try {
        const inventory = await Inventory.find().populate("product");
        res.json({
            message: "Lấy danh sách tồn kho thành công",
            data: inventory
        });
    } catch (error) {
        res.status(500).json({
            message: "Lỗi server",
            error: error.message
        });
    }
  },

  // Lấy inventory theo ID
  getInventoryById: async (req, res) => {
    try {
      const { id } = req.params;
      const inventory = await Inventory.findById(id).populate('product');

      if (!inventory) {
        return res.status(404).json({
          success: false,
          message: 'Inventory item not found'
        });
      }

      res.json({
        success: true,
        data: inventory
      });
    } catch (error) {
      console.error('Get inventory by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get inventory item'
      });
    }
  },

  // Tạo inventory mới
  createInventory: async (req, res) => {
    try {
      const { product, quantity, price, image } = req.body;

      // Kiểm tra product tồn tại
      const productExists = await Product.findById(product);
      if (!productExists) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      const inventory = new Inventory({
        product,
        quantity,
        price,
        image
      });

      await inventory.save();

      // Populate lại để trả về thông tin đầy đủ
      const populatedInventory = await Inventory.findById(inventory._id)
        .populate('product', 'name');

      res.status(201).json({
        success: true,
        message: 'Inventory created successfully',
        data: populatedInventory
      });
    } catch (error) {
      console.error('Create inventory error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create inventory'
      });
    }
  },

  // Cập nhật inventory
  updateInventory: async (req, res) => {
    try {
      const { id } = req.params;
      const { quantity, price } = req.body;

      const inventory = await Inventory.findByIdAndUpdate(
        id,
        { quantity, price },
        { new: true, runValidators: true }
      ).populate('product', 'name');

      if (!inventory) {
        return res.status(404).json({
          success: false,
          message: 'Inventory item not found'
        });
      }

      res.json({
        success: true,
        message: 'Inventory updated successfully',
        data: inventory
      });
    } catch (error) {
      console.error('Update inventory error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update inventory'
      });
    }
  },

  // Xóa inventory
  deleteInventory: async (req, res) => {
    try {
      const { id } = req.params;
      const inventory = await Inventory.findByIdAndDelete(id);

      if (!inventory) {
        return res.status(404).json({
          success: false,
          message: 'Inventory item not found'
        });
      }

      res.json({
        success: true,
        message: 'Inventory item deleted successfully'
      });
    } catch (error) {
      console.error('Delete inventory error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete inventory item'
      });
    }
  }
};

module.exports = inventoryController;
