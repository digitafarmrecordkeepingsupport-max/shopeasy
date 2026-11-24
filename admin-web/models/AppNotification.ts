import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAppNotification extends Document {
  customerId?: string;
  customerEmail?: string;
  title: string;
  message: string;
  type: 'order' | 'payment' | 'promo' | 'system';
  relatedId?: string;
  isRead: boolean;
  audience?: 'all' | 'vip' | 'new' | 'single';
  createdAt: Date;
  updatedAt: Date;
}

const AppNotificationSchema = new Schema<IAppNotification>(
  {
    customerId: { type: String, index: true },
    customerEmail: { type: String, lowercase: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['order', 'payment', 'promo', 'system'],
      default: 'system',
    },
    relatedId: { type: String },
    isRead: { type: Boolean, default: false },
    audience: {
      type: String,
      enum: ['all', 'vip', 'new', 'single'],
      default: 'all',
    },
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

export const AppNotification: Model<IAppNotification> =
  mongoose.models.AppNotification ||
  mongoose.model<IAppNotification>('AppNotification', AppNotificationSchema);

export default AppNotification;
