const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  // fullName: {
  //   type: String,
  //   required: true,
  //   trim: true
  // },
  // avatar: {
  //   type: String,
  //   default: null
  // },
  dateOfBirth: {
    type: Date,
    default: null
  },
  role: {
    type: Number,
    enum: [0, 1], // 0: user, 1: admin
    default: 0
  },
  address: {
    type: String,
    default: null,
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Account', accountSchema);
