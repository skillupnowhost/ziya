import mongoose, { Schema, Document, Model } from 'mongoose';

export type CouponAction =
  | 'claimed'
  | 'used'
  | 'rejected_already_used'
  | 'rejected_not_first_order'
  | 'rejected_not_found'
  | 'duplicate_email_attempt';

export interface ICouponLog extends Document {
  email: string;
  couponCode: string;
  action: CouponAction;
  reason?: string;
  ipAddress?: string;
  userId?: mongoose.Types.ObjectId;
  orderId?: mongoose.Types.ObjectId;
  isAdminRead: boolean;
  createdAt: Date;
}

const CouponLogSchema = new Schema<ICouponLog>(
  {
    email:       { type: String, required: true, lowercase: true, trim: true },
    couponCode:  { type: String, required: true },
    action:      {
      type: String,
      enum: ['claimed', 'used', 'rejected_already_used', 'rejected_not_first_order', 'rejected_not_found', 'duplicate_email_attempt'],
      required: true,
    },
    reason:      { type: String },
    ipAddress:   { type: String },
    userId:      { type: Schema.Types.ObjectId, ref: 'User' },
    orderId:     { type: Schema.Types.ObjectId, ref: 'Order' },
    isAdminRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const CouponLog: Model<ICouponLog> =
  mongoose.models.CouponLog ||
  mongoose.model<ICouponLog>('CouponLog', CouponLogSchema);

export default CouponLog;
