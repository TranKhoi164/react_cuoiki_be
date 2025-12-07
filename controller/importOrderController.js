const ImportOrder = require('../models/importOrder');
const ImportDetail = require('../models/importDetails');
const Inventory = require('../models/Inventory');
const mongoose = require('mongoose');
const Product = require('../models/Product');

// Create new import order
const createImportOrder = async (req, res) => {
  let savedOrder = null;

  try {
    const { importDate, totalAmount, note, importDetails } = req.body;

    console.log('🟡 Bắt đầu tạo phiếu nhập với:', importDetails?.length, 'sản phẩm');
    console.log('📦 Chi tiết sản phẩm:', importDetails);

    // Validate
    if (!importDetails || importDetails.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Import order must have at least one product'
      });
    }

    // 1. Tạo import order
    const importOrder = new ImportOrder({
      importDate: importDate || new Date(),
      totalAmount,
      note: note || '',
      status: 'completed'
    });

    savedOrder = await importOrder.save();
    console.log('✅ Đã tạo import order:', savedOrder._id);

    // 2. Tạo import details và cập nhật inventory/product
    const importDetailsToCreate = [];

    for (const detail of importDetails) {
      console.log(`📦 Xử lý sản phẩm ${detail.productId}, số lượng: ${detail.quantity}`);
      
      // Tạo import detail
      const importDetail = new ImportDetail({
        importOrderId: savedOrder._id,
        productId: detail.productId,
        quantity: detail.quantity,
        price: detail.price,
        total: detail.quantity * detail.price
      });

      importDetailsToCreate.push(importDetail.save());

      // Cập nhật inventory (CHỈ cập nhật nếu tồn tại)
      // const inventoryUpdate = await Inventory.findOneAndUpdate(
      //   { product: detail.productId },
      //   { 
      //     $inc: { 
      //       stock: detail.quantity,
      //       quantity: detail.quantity 
      //     },
      //     $set: { price: detail.price }
      //   },
      //   { new: true }
      // );

      // if (inventoryUpdate) {
      //   console.log(`✅ Đã cập nhật inventory: ${inventoryUpdate._id}`);
      // } else {
      //   console.log(`⚠️ Không tìm thấy inventory cho sản phẩm ${detail.productId}, bỏ qua`);
      // }
      let inventoryUpdate = await Inventory.findOne({ product: detail.productId });

      if (inventoryUpdate) {
        // Nếu đã tồn tại, cộng thêm quantity
        inventoryUpdate.quantity += detail.quantity;
        inventoryUpdate.price = detail.price;
        await inventoryUpdate.save();
      } else {
        // Nếu chưa tồn tại, tạo mới
        inventoryUpdate = new Inventory({
          product: detail.productId,
          quantity: detail.quantity,
          price: detail.price
        });
        await inventoryUpdate.save();
      }
      console.log(`✅ Đã cập nhật inventory: ${inventoryUpdate._id}, số lượng: ${inventoryUpdate.quantity}`);

      // Cập nhật product quantity (đồng bộ với inventory)
      const productUpdate = await Product.findByIdAndUpdate(
        detail.productId,
        { 
          $inc: { quantity: detail.quantity },
          $set: { price: detail.price }
        },
        { new: true }
      );

      if (productUpdate) {
        console.log(`✅ Đã cập nhật product: ${productUpdate.name}, số lượng mới: ${productUpdate.quantity}`);
      } else {
        console.log(`❌ Lỗi: Không tìm thấy product ${detail.productId}`);
        throw new Error(`Product ${detail.productId} not found`);
      }
    }

    // Đợi tất cả import details được tạo
    await Promise.all(importDetailsToCreate);
    console.log('✅ Đã tạo tất cả import details');

    // 3. Populate kết quả
    const populatedOrder = await ImportOrder.findById(savedOrder._id)
      .populate({
        path: 'importDetails',
        populate: {
          path: 'productId',
          select: 'name sku images quantity'
        }
      });

    console.log('🎉 Tạo phiếu nhập thành công!');
    console.log('📊 Thông tin phiếu nhập:', {
      id: populatedOrder._id,
      totalAmount: populatedOrder.totalAmount,
      productCount: populatedOrder.importDetails.length
    });

    res.status(201).json({
      success: true,
      message: 'Import order created successfully',
      data: populatedOrder
    });

  } catch (error) {
    console.error('❌ Lỗi tạo phiếu nhập:', error);
    
    // Rollback manual nếu có lỗi
    if (savedOrder) {
      try {
        console.log('🔄 Đang rollback...');
        await ImportOrder.findByIdAndDelete(savedOrder._id);
        await ImportDetail.deleteMany({ importOrderId: savedOrder._id });
        console.log('✅ Đã rollback thành công');
      } catch (rollbackError) {
        console.error('❌ Lỗi rollback:', rollbackError);
      }
    }
    
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create import order'
    });
  }
};

// Get all import orders - SỬA populate
const getImportOrders = async (req, res) => {
  try {
    const importOrders = await ImportOrder.find()
      .populate({
        path: 'importDetails',
        populate: {
          path: 'productId',
          select: 'name sku'
        }
      })
      .sort({ importDate: -1 });

    res.json({
      success: true,
      data: importOrders
    });
  } catch (error) {
    console.error('Get import orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get import orders'
    });
  }
};

// Get import order by ID - SỬA populate
const getImportOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const importOrder = await ImportOrder.findById(id)
      .populate({
        path: 'importDetails',
        populate: {
          path: 'productId',
          select: 'name sku images category price'
        }
      });

    if (!importOrder) {
      return res.status(404).json({
        success: false,
        message: 'Import order not found'
      });
    }

    res.json({
      success: true,
      data: importOrder
    });
  } catch (error) {
    console.error('Get import order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get import order'
    });
  }
};

// Các hàm khác giữ nguyên...
const deleteImportOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const importOrder = await ImportOrder.findById(id);
    if (!importOrder) {
      return res.status(404).json({
        success: false,
        message: 'Import order not found'
      });
    }

    // Get import details
    const importDetails = await ImportDetail.find({ importOrderId: id });

    // Reverse inventory updates
    for (const detail of importDetails) {
      // Cập nhật inventory
      const inventory = await Inventory.findOne({ product: detail.productId });
      if (inventory) {
        inventory.quantity = Math.max(0, inventory.quantity - detail.quantity);
        await inventory.save();
      }

      // Update product quantity
      const product = await Product.findById(detail.productId);
      if (product) {
        product.quantity = Math.max(0, product.quantity - detail.quantity);
        await product.save();
      }
    }

    // Delete import details
    await ImportDetail.deleteMany({ importOrderId: id });
    
    // Delete import order
    await ImportOrder.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Import order deleted successfully'
    });
  } catch (error) {
    console.error('Delete import order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete import order'
    });
  }
};

const getImportStatistics = async (req, res) => {
  try {
    // Total import value
    const totalImport = await ImportOrder.aggregate([
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$totalAmount' },
          totalOrders: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        totalImport: totalImport[0] || { totalAmount: 0, totalOrders: 0 }
      }
    });
  } catch (error) {
    console.error('Get import statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get import statistics'
    });
  }
};

module.exports = {
  createImportOrder,
  getImportOrders,
  getImportOrderById,
  deleteImportOrder,
  getImportStatistics
};