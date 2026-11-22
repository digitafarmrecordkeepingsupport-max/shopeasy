const mongoose = require('mongoose');

const MarketingCampaignSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, required: true, default: 'Discount' },
    description: { type: String, trim: true },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    status: {
      type: String,
      enum: ['Active', 'Completed', 'Scheduled', 'Draft'],
      default: 'Active',
      index: true,
    },
    thumbnailUrl: { type: String },
    bannerUrl: { type: String },
    discountRate: { type: String },
    reach: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    conversions: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.MarketingCampaign ||
  mongoose.model('MarketingCampaign', MarketingCampaignSchema);
