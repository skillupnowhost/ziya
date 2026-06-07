import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INewsletterCoupon extends Document {
  email: string;
  couponCode: string;
  isUsed: boolean;
  usedAt?: Date;
  usedByUserId?: mongoose.Types.ObjectId;
  usedInOrderId?: mongoose.Types.ObjectId;
  ipAddress?: string;
  createdAt: Date;
}

const NewsletterCouponSchema = new Schema<INewsletterCoupon>(
  {
    email:          { type: String, required: true, unique: true, lowercase: true, trim: true },
    couponCode:     { type: String, required: true, unique: true, uppercase: true },
    isUsed:         { type: Boolean, default: false },
    usedAt:         { type: Date },
    usedByUserId:   { type: Schema.Types.ObjectId, ref: 'User' },
    usedInOrderId:  { type: Schema.Types.ObjectId, ref: 'Order' },
    ipAddress:      { type: String },
  },
  { timestamps: true }
);

const NewsletterCoupon: Model<INewsletterCoupon> =
  mongoose.models.NewsletterCoupon ||
  mongoose.model<INewsletterCoupon>('NewsletterCoupon', NewsletterCouponSchema);

export default NewsletterCoupon;
