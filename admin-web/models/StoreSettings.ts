import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IStoreSettings extends Document {
  storeName: string;
  storeEmail: string;
  currency: string;
  currencySymbol: string;
  taxRatePercent: number;
  deliveryFeeStandard: number;
  minFreeDeliveryThreshold: number;
  logoUrl?: string;
  updatedAt: Date;
}

const StoreSettingsSchema = new Schema<IStoreSettings>(
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

export const StoreSettings: Model<IStoreSettings> =
  mongoose.models.StoreSettings ||
  mongoose.model<IStoreSettings>('StoreSettings', StoreSettingsSchema);

export default StoreSettings;
