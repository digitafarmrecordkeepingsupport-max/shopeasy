const mongoose = require('mongoose');

const AddressSchema = new mongoose.Schema({
  recipientName: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  streetAddress: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String },
  isDefault: { type: Boolean, default: false },
});

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String },
    fullName: { type: String, required: true, trim: true },
    phoneNumber: { type: String, trim: true },
    avatarUrl: { type: String },
    role: {
      type: String,
      enum: ['customer', 'admin', 'super_admin'],
      default: 'customer',
      index: true,
    },
    accountStatus: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active',
      index: true,
    },
    addresses: [AddressSchema],
    totalOrders: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
