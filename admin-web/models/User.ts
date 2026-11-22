import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUserAddress {
  recipientName: string;
  phoneNumber: string;
  streetAddress: string;
  city: string;
  state: string;
  isDefault: boolean;
}

export interface IUser extends Document {
  email: string;
  passwordHash?: string;
  fullName: string;
  phoneNumber?: string;
  avatarUrl?: string;
  role: 'customer' | 'admin' | 'super_admin';
  accountStatus: 'active' | 'inactive' | 'suspended';
  addresses: IUserAddress[];
  totalOrders: number;
  totalSpent: number;
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema<IUserAddress>({
  recipientName: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  streetAddress: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  isDefault: { type: Boolean, default: false },
});

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String },
    fullName: { type: String, required: true, trim: true },
    phoneNumber: { type: String, trim: true },
    avatarUrl: { type: String },
    role: {
      type: String,
      enum: ['customer', 'admin', 'super_admin'],
      default: 'customer',
      index: true,
    },
    accountStatus: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active',
      index: true,
    },
    addresses: [AddressSchema],
    totalOrders: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_, ret: any) => {
        ret.id = ret._id?.toString();
        delete ret._id;
        delete ret.__v;
        delete ret.passwordHash;
        return ret;
      },
    },
  }
);

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
