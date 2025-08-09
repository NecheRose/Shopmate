import mongoose from 'mongoose';



// Category schema (flat/no nesting, no parent)
const categorySchema = mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  description: String,
}, {timestamps: true})


export const Category = mongoose.model('Category', categorySchema);

