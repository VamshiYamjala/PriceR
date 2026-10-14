// server/src/models/Product.js
import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    brand: {
      type: String,
      required: false,
    },
    model: {
      type: String,
      required: false,
    },
    variant: {
      type: String,
      required: false,
    },
    canonicalKey: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    imageUrl: {
      type: String,
      required: false,
    },
    category: {
      type: String,
      required: false,
      trim: true,
    },
    description: {
      type: String,
      required: false,
    },
    sourceProvider: {
      type: String,
      required: false,
      default: 'fixture',
    },
    externalId: {
      type: String,
      required: false,
    },
    sourceUrl: {
      type: String,
      required: false,
    },
    dataStatus: {
      type: String,
      enum: ['sample', 'live', 'cached', 'unavailable'],
      default: 'sample',
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const Product = mongoose.model('Product', productSchema);
export default Product;
