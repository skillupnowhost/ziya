import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAddress {
  street?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  phone?: string;
  avatar?: string;
  addresses: IAddress[];
  defaultAddress: number;
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema<IAddress>({
  street:  { type: String },
  city:    { type: String },
  state:   { type: String },
  pincode: { type: String },
  country: { type: String },
}, { _id: false });

const UserSchema = new Schema<IUser>(
  {
    name:           { type: String, required: true },
    email:          { type: String, required: true, unique: true, lowercase: true },
    password:       { type: String, required: true },
    role:           { type: String, enum: ['user', 'admin'], default: 'user' },
    phone:          { type: String },
    avatar:         { type: String },
    addresses:      { type: [AddressSchema], default: [] },
    defaultAddress: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
