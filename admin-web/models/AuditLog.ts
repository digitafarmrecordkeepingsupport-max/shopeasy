import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAuditLog extends Document {
  adminEmail: string;
  adminName: string;
  action: string;
  entityType: 'product' | 'category' | 'order' | 'customer' | 'coupon' | 'settings' | 'inventory' | 'support' | 'marketing';
  entityId?: string;
  details: string;
  timestamp: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    adminEmail: { type: String, required: true },
    adminName: { type: String, required: true },
    action: { type: String, required: true },
    entityType: {
      type: String,
      enum: ['product', 'category', 'order', 'customer', 'coupon', 'settings', 'inventory', 'support', 'marketing'],
      required: true,
    },
    entityId: { type: String },
    details: { type: String, required: true },
    timestamp: { type: Date, default: Date.now, index: true },
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

export const AuditLog: Model<IAuditLog> =
  mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);

export default AuditLog;
