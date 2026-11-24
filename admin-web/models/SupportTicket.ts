import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISupportTicket extends Document {
  customerName: string;
  customerEmail: string;
  category: 'orders' | 'payment' | 'delivery' | 'general';
  subject: string;
  description: string;
  relatedOrderNumber?: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SupportTicketSchema = new Schema<ISupportTicket>(
  {
    customerName: { type: String, required: true, trim: true },
    customerEmail: { type: String, required: true, lowercase: true, trim: true, index: true },
    category: {
      type: String,
      enum: ['orders', 'payment', 'delivery', 'general'],
      default: 'general',
    },
    subject: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    relatedOrderNumber: { type: String, trim: true },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved', 'closed'],
      default: 'open',
      index: true,
    },
    adminNotes: { type: String },
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

export const SupportTicket: Model<ISupportTicket> =
  mongoose.models.SupportTicket ||
  mongoose.model<ISupportTicket>('SupportTicket', SupportTicketSchema);

export default SupportTicket;
