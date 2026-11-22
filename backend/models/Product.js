const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    description: { type: String, default: '', trim: true },
    categoryId: { type: String, required: true, index: true },
    categoryName: { type: String },
    price: { type: Number, required: true, min: 0, index: true },
    originalPrice: { type: Number, min: 0 },
    stockQuantity: { type: Number, required: true, min: 0, default: 0 },
    sku: { type: String, required: true, unique: true, uppercase: true, trim: true },
    imageUrls: [{ type: String }],
    isFeatured: { type: Boolean, default: false, index: true },
    isActive: { type: Boolean, default: true, index: true },
    rating: { type: Number, default: 4.8, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Product || mongoose.model('Product', ProductSchema);
