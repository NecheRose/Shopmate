import mongoose from "mongoose";


// Category schema (flat/no nesting, no parent)
const categorySchema = mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, unique: true },
  description: String,
}, {timestamps: true})


const Category = mongoose.model("Category", categorySchema);

export default Category;

