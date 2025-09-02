import mongoose from "mongoose";


// Subschema for attribute
const attributeSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    value: { type: String, required: true }
  },
  { _id: false }  
);
// Subschema fro image
const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true }
  },
  { _id: false }  
);

// Schema to handle dynamic variant attributes per product
const variantSchema = new mongoose.Schema(
  {
    attributes: [attributeSchema],
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    images: [imageSchema]
  },
  { _id: true } 
);

const productSchema =  new mongoose.Schema({
  productName: { type: String, required: true },
  category: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }], // link to category model
  description: { type: String, required: true },
  price: Number, // fallback price when there are no variants.
  quantity: Number, // required only if no variants
  hasVariants: {type: Boolean, required: true, default: false},
  variants: {type: [variantSchema], default: [] },
  images: [{
    url: { type: String, required: true },
    publicId: { type: String, required: true }
  }]
}, { timestamps: true }); 


const Product = mongoose.model("Product", productSchema);

export default Product;

