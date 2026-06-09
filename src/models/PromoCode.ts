import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPromoCode extends Document {
  code: string;
  description?: string;
  discountType: 'percent' | 'flat' | 'shipping';
  discountValue: number;
  minOrderValue?: number;
  maxUses?: number;
  usedCount: number;
  expiresAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PromoCodeSchema = new Schema<IPromoCode>(
  {
    code:          { type: String, required: true, unique: true, uppercase: true, trim: true },
    description:   { type: String, trim: true },
    discountType:  { type: String, enum: ['percent', 'flat', 'shipping'], required: true },
    discountValue: { type: Number, required: true, min: 0 },
    minOrderValue: { type: Number, min: 0 },
    maxUses:       { type: Number, min: 1 },
    usedCount:     { type: Number, default: 0 },
    expiresAt:     { type: Date },
    isActive:      { type: Boolean, default: true },
  },
  { timestamps: true }
);

const PromoCode: Model<IPromoCode> =
  mongoose.models.PromoCode ||
  mongoose.model<IPromoCode>('PromoCode', PromoCodeSchema);

export default PromoCode;
