const mongoose = require("mongoose");

const ImportOrderSchema = new mongoose.Schema({
  importDate: {
    type: Date,
    default: Date.now
  },
  totalAmount: {
    type: Number,
    required: true
  },
  note: {
    type: String,
    default: ""
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'completed'
  }
}, {
  timestamps: true,
  // THÊM dòng này để cho phép populate virtual
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// THÊM virtual populate cho importDetails
ImportOrderSchema.virtual('importDetails', {
  ref: 'ImportDetail',
  localField: '_id',
  foreignField: 'importOrderId'
});

module.exports = mongoose.model("ImportOrder", ImportOrderSchema);