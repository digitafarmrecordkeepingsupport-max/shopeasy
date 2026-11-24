import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IInventoryMovement extends Document {
  productId: string;
  productName: string;
  movementType: 'restock' | 'sale' | 'return' | 'adjustment' | 'cancellation' | 'damage';
  quantityChange: number;
  previousStock: number;
  newStock: number;
  reason: string;
  adminEmail: string;
  relatedOrderId?: string;
  createdAt: Date;
}

const InventoryMovementSchema = new Schema<IInventoryMovement>(
  {
    productId: { type: String, required: true, index: true },
    productName: { type: String, required: true },
    movementType: {
      type: String,
      enum: ['restock', 'sale', 'return', 'adjustment', 'cancellation', 'damage'],
      required: true,
    },
    quantityChange: { type: Number, required: true },
    previousStock: { type: Number, required: true },
    newStock: { type: Number, required: true },
    reason: { type: String, required: true },
    adminEmail: { type: String, default: 'admin@shopeasy.com' },
    relatedOrderId: { type: String },
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

export const InventoryMovement: Model<IInventoryMovement> =
  mongoose.models.InventoryMovement ||
  mongoose.model<IInventoryMovement>('InventoryMovement', InventoryMovementSchema);

export default InventoryMovement;
