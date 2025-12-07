// const Inventory = require("../models/Inventory");

// // =============================
// // GET /inventory
// // =============================
// exports.getAllInventory = async (req, res) => {
//   try {
//     const inventory = await Inventory.find().populate("product");
//     res.json({
//       message: "Lấy danh sách tồn kho thành công",
//       data: inventory
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: "Lỗi server",
//       error: error.message
//     });
//   }
// };

// // =============================
// // GET /inventory/:id
// // =============================
// exports.getInventoryById = async (req, res) => {
//   try {
//     const item = await Inventory.findById(req.params.id).populate("product");

//     if (!item) {
//       return res.status(404).json({ message: "Không tìm thấy dữ liệu tồn kho" });
//     }

//     res.json({
//       message: "Lấy chi tiết tồn kho thành công",
//       data: item
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: "Lỗi server",
//       error: error.message
//     });
//   }
// };

// // =============================
// // POST /inventory
// // =============================
// exports.createInventory = async (req, res) => {
//   try {
//     const newItem = await Inventory.create(req.body);

//     res.status(201).json({
//       message: "Tạo tồn kho thành công",
//       data: newItem
//     });
//   } catch (error) {
//     res.status(400).json({
//       message: "Tạo tồn kho thất bại",
//       error: error.message
//     });
//   }
// };

// // =============================
// // PUT /inventory/:id
// // =============================
// exports.updateInventory = async (req, res) => {
//   try {
//     const updated = await Inventory.findByIdAndUpdate(
//       req.params.id,
//       req.body,
//       { new: true, runValidators: true }
//     );

//     if (!updated) {
//       return res.status(404).json({ message: "Không tìm thấy tồn kho để cập nhật" });
//     }

//     res.json({
//       message: "Cập nhật tồn kho thành công",
//       data: updated
//     });
//   } catch (error) {
//     res.status(400).json({
//       message: "Cập nhật thất bại",
//       error: error.message
//     });
//   }
// };

// // =============================
// // DELETE /inventory/:id
// // =============================
// exports.deleteInventory = async (req, res) => {
//   try {
//     const deleted = await Inventory.findByIdAndDelete(req.params.id);

//     if (!deleted) {
//       return res.status(404).json({ message: "Không tìm thấy tồn kho để xóa" });
//     }

//     res.json({
//       message: "Xóa tồn kho thành công"
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: "Xóa thất bại",
//       error: error.message
//     });
//   }
// };

// const Inventory = require("../models/Inventory");
// const Product = require("../models/Product");

// const inventoryController = {
//   // Lấy tất cả inventory
//   getAllInventory: async (req, res) => {
//     try {
//         const inventory = await Inventory.find().populate("product");
//         res.json({
//             message: "Lấy danh sách tồn kho thành công",
//             data: inventory
//         });
//     } catch (error) {
//         res.status(500).json({
//             message: "Lỗi server",
//             error: error.message
//         });
//     }
//   },

//   // Lấy inventory theo ID
//   getInventoryById: async (req, res) => {
//     try {
//       const { id } = req.params;

//       const inventory = await Inventory.findById(id)
//         .populate('product', 'name category description images')
//         .populate({
//           path: 'product',
//           populate: {
//             path: 'category',
//             select: 'name'
//           }
//         });

//       if (!inventory) {
//         return res.status(404).json({
//           success: false,
//           message: 'Inventory item not found'
//         });
//       }

//       res.json({
//         success: true,
//         data: inventory
//       });
//     } catch (error) {
//       console.error('Get inventory by ID error:', error);
//       res.status(500).json({
//         success: false,
//         message: 'Failed to get inventory item'
//       });
//     }
//   },

//   // Tạo inventory mới
//   createInventory: async (req, res) => {
//     try {
//       const { product, sku, attribute, stock, price, image } = req.body;

//       // Kiểm tra product tồn tại
//       const productExists = await Product.findById(product);
//       if (!productExists) {
//         return res.status(404).json({
//           success: false,
//           message: 'Product not found'
//         });
//       }

//       // Kiểm tra SKU đã tồn tại chưa
//       const existingSku = await Inventory.findOne({ sku });
//       if (existingSku) {
//         return res.status(400).json({
//           success: false,
//           message: 'SKU already exists'
//         });
//       }

//       const inventory = new Inventory({
//         product,
//         sku,
//         attribute: attribute || {},
//         stock,
//         quantity: stock,
//         price,
//         image
//       });

//       await inventory.save();

//       // Populate lại để trả về thông tin đầy đủ
//       const populatedInventory = await Inventory.findById(inventory._id)
//         .populate('product', 'name category images');

//       res.status(201).json({
//         success: true,
//         message: 'Inventory created successfully',
//         data: populatedInventory
//       });
//     } catch (error) {
//       console.error('Create inventory error:', error);
//       res.status(500).json({
//         success: false,
//         message: 'Failed to create inventory'
//       });
//     }
//   },

//   // Cập nhật inventory
//   updateInventory: async (req, res) => {
//     try {
//       const { id } = req.params;
//       const { stock, price, sku, attribute } = req.body;

//       const inventory = await Inventory.findByIdAndUpdate(
//         id,
//         { 
//           stock, 
//           price, 
//           sku, 
//           attribute,
//           quantity: stock // Cập nhật quantity khi stock thay đổi
//         },
//         { new: true, runValidators: true }
//       ).populate('product', 'name');

//       if (!inventory) {
//         return res.status(404).json({
//           success: false,
//           message: 'Inventory item not found'
//         });
//       }

//       res.json({
//         success: true,
//         message: 'Inventory updated successfully',
//         data: inventory
//       });
//     } catch (error) {
//       console.error('Update inventory error:', error);
//       res.status(500).json({
//         success: false,
//         message: 'Failed to update inventory'
//       });
//     }
//   },

//   // Xóa inventory
//   deleteInventory: async (req, res) => {
//     try {
//       const { id } = req.params;

//       const inventory = await Inventory.findByIdAndDelete(id);

//       if (!inventory) {
//         return res.status(404).json({
//           success: false,
//           message: 'Inventory item not found'
//         });
//       }

//       res.json({
//         success: true,
//         message: 'Inventory item deleted successfully'
//       });
//     } catch (error) {
//       console.error('Delete inventory error:', error);
//       res.status(500).json({
//         success: false,
//         message: 'Failed to delete inventory item'
//       });
//     }
//   }
// };

// module.exports = inventoryController;

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
