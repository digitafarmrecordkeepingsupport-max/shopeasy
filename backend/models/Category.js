const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    description: { type: String, trim: true },
    iconName: { type: String, default: 'tag' },
    imageUrl: { type: String },
    color: { type: String, default: '#F3E8FF' },
    isActive: { type: Boolean, default: true, index: true },
    itemCount: { type: Number, default: 0 },
    displayOrder: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Category || mongoose.model('Category', CategorySchema);
