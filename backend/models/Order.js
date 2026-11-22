const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  productName: { type: String, required: true },
  productImage: { type: String, required: true },
  unitPrice: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  total: { type: Number, required: true },
  selectedSize: { type: String },
  selectedColor: { type: String },
});

const OrderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    customerId: { type: String, index: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true, lowercase: true, index: true },
    customerPhone: { type: String },
    items: [OrderItemSchema],
    subtotal: { type: Number, required: true, min: 0 },
    deliveryFee: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'NGN' },
    paymentMethod: {
      type: String,
      enum: ['card', 'transfer', 'paystack', 'cash_on_delivery'],
      default: 'card',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
      index: true,
    },
    orderStatus: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
      index: true,
    },
    deliveryAddress: {
      recipientName: { type: String, required: true },
      phone: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String },
      address: { type: String, required: true },
    },
    trackingNumber: { type: String },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Order || mongoose.model('Order', OrderSchema);
