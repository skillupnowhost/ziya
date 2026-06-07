import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReview extends Document {
  userId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  userName: string;
  userAvatar?: string;
  rating: number;
  title?: string;
  comment: string;
  images: string[];
  isVerifiedPurchase: boolean;
  helpful: number;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    userId:             { type: Schema.Types.ObjectId, ref: 'User', required: true },
    productId:          { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    userName:           { type: String, required: true },
    userAvatar:         { type: String },
    rating:             { type: Number, required: true, min: 1, max: 5 },
    title:              { type: String },
    comment:            { type: String, required: true },
    images:             { type: [String], default: [] },
    isVerifiedPurchase: { type: Boolean, default: false },
    helpful:            { type: Number, default: 0 },
  },
  { timestamps: true }
);

ReviewSchema.index({ productId: 1, createdAt: -1 });
ReviewSchema.index({ userId: 1, productId: 1 }, { unique: true });

const Review: Model<IReview> =
  mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);

export default Review;
