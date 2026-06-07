import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description: string;
  category: 'accessories' | 'dresses' | 'stationery' | 'beauty' | 'gifts';
  subcategory?: string;
  price: number;
  discountPrice?: number;
  stock: number;
  sizes: string[];
  colors: string[];
  images: string[];
  tags: string[];
  sku?: string;
  brand: string;
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  isNewProduct: boolean;
  isTrending: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name:          { type: String, required: true },
    description:   { type: String, required: true },
    category:      { type: String, required: true, enum: ['accessories', 'dresses', 'stationery', 'beauty', 'gifts'] },
    subcategory:   { type: String },
    price:         { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, min: 0 },
    stock:         { type: Number, required: true, default: 0 },
    sizes:         { type: [String], default: [] },
    colors:        { type: [String], default: [] },
    images:        { type: [String], default: [] },
    tags:          { type: [String], default: [] },
    sku:           { type: String, sparse: true, unique: true },
    brand:         { type: String, default: 'Ziya' },
    rating:        { type: Number, default: 0, min: 0, max: 5 },
    reviewCount:   { type: Number, default: 0 },
    isFeatured:    { type: Boolean, default: false },
    isNewProduct:  { type: Boolean, default: true },
    isTrending:    { type: Boolean, default: false },
    isActive:      { type: Boolean, default: true },
  },
  { timestamps: true }
);

ProductSchema.index({ name: 'text', description: 'text', tags: 'text' });
ProductSchema.index({ category: 1, isActive: 1 });
ProductSchema.index({ isTrending: 1, isNewProduct: 1 });

const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
