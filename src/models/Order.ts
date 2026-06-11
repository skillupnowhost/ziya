import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  name: string;
  image: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
}

export interface IShippingAddress {
  name?: string;
  phone?: string;
  street?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
}

export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId;
  items: IOrderItem[];
  shippingAddress: IShippingAddress;
  paymentMethod: 'razorpay' | 'upi' | 'cod' | 'manual';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentId?: string;
  razorpayOrderId?: string;
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  promoCode?: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  trackingNumber?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product' },
    name:      { type: String, required: true },
    image:     { type: String },
    price:     { type: Number, required: true },
    quantity:  { type: Number, required: true },
    size:      { type: String },
    color:     { type: String },
  },
  { _id: false }
);

const ShippingAddressSchema = new Schema<IShippingAddress>(
  {
    name:    { type: String },
    phone:   { type: String },
    street:  { type: String },
    city:    { type: String },
    state:   { type: String },
    pincode: { type: String },
    country: { type: String },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    userId:          { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items:           { type: [OrderItemSchema], required: true },
    shippingAddress: { type: ShippingAddressSchema, required: true },
    paymentMethod:   { type: String, required: true, enum: ['razorpay', 'upi', 'cod', 'manual'] },
    paymentStatus:   { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
    paymentId:       { type: String },
    razorpayOrderId: { type: String },
    subtotal:        { type: Number, required: true },
    shippingCost:    { type: Number, required: true, default: 0 },
    discount:        { type: Number, required: true, default: 0 },
    total:           { type: Number, required: true },
    promoCode:       { type: String },
    status:          { type: String, enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
    trackingNumber:  { type: String },
    notes:           { type: String },
  },
  { timestamps: true }
);

OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ status: 1, createdAt: -1 });

const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);

export default Order;
