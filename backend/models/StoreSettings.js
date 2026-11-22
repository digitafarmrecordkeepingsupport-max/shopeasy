const mongoose = require('mongoose');

const StoreSettingsSchema = new mongoose.Schema(
  {
    storeName: { type: String, default: 'ShopEasy' },
    storeEmail: { type: String, default: 'support@shopeasy.com' },
    currency: { type: String, default: 'NGN' },
    currencySymbol: { type: String, default: '₦' },
    taxRatePercent: { type: Number, default: 0 },
    deliveryFeeStandard: { type: Number, default: 2000 },
    minFreeDeliveryThreshold: { type: Number, default: 50000 },
    logoUrl: { type: String },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.StoreSettings || mongoose.model('StoreSettings', StoreSettingsSchema);
