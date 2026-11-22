import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMarketingCampaign extends Document {
  name: string;
  type: 'Discount' | 'Product Launch' | 'Shipping' | 'Seasonal' | string;
  description?: string;
  startDate: string;
  endDate: string;
  status: 'Active' | 'Completed' | 'Scheduled' | 'Draft';
  thumbnailUrl?: string;
  bannerUrl?: string;
  discountRate?: string;
  reach: number;
  clicks: number;
  conversions: number;
  createdAt: Date;
  updatedAt: Date;
}

const MarketingCampaignSchema = new Schema<IMarketingCampaign>(
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
    toJSON: {
      virtuals: true,
      transform: (_, ret: any) => {
        ret.id = ret._id?.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const MarketingCampaign: Model<IMarketingCampaign> =
  mongoose.models.MarketingCampaign ||
  mongoose.model<IMarketingCampaign>('MarketingCampaign', MarketingCampaignSchema);

export default MarketingCampaign;
