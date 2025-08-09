import mongoose from 'mongoose';



// Schema to handle dynamic variant attributes per product
const variantSchema = new mongoose.Schema({
  attributes: { type: Map, of: String, required: true },
  sku: { type: String, required: true}, // check uniqueness
  price: { type: Number, required: true },
  quantity: { type: Number, required: true }
}, { _id: false });

const productSchema =  new mongoose.Schema({
  productName: { type: String, required: true },
  category: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }], // link to category model
  description: { type: String, required: true },
  price: Number, // fallback price when there are no variants.
  quantity: Number, // required only if no variants
  hasVariants: {type: Boolean, required: true, default: false},
  variants: {type: [variantSchema], default: [] },
  images: [String]
}, { timestamps: true }); 
export const Product = mongoose.model('Product', productSchema);

