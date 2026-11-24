import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProductReview extends Document {
  productId: string;
  customerName: string;
  customerAvatar?: string;
  customerEmail?: string;
  rating: number;
  comment: string;
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductReviewSchema = new Schema<IProductReview>(
  {
    productId: { type: String, required: true, index: true },
    customerName: { type: String, required: true, trim: true },
    customerAvatar: { type: String },
    customerEmail: { type: String, lowercase: true, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true },
    isVerifiedPurchase: { type: Boolean, default: true },
    isApproved: { type: Boolean, default: true, index: true },
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

export const ProductReview: Model<IProductReview> =
  mongoose.models.ProductReview ||
  mongoose.model<IProductReview>('ProductReview', ProductReviewSchema);

export default ProductReview;
