import Category from "../../models/categorySchema.js";
import slugify from "slugify";



export const createCategory = async (req, res) => {
  try {
    const {name, description} = req.body;

    // Role check
    if (req.user.role !== "admin" && req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Admins only!" });
    }

    const categoryExists = await Category.findOne({ name });
    if (categoryExists) {
      return res.status(400).json({ message: "Category already exists" });
    }

    // Generate base slug
    let baseSlug = slugify(name, { lower: true, strict: true });
    let slug = baseSlug;

    // Ensure unique slug
    let counter = 2;
    while (await Category.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Create category 
    const category = new Category({ name, slug, description });

    await category.save();

    res.status(201).json({ message: "Category created successfully", category });
  } catch (err) {
    console.error("category creation failed:", err)
    res.status(500).json({ message: "Error creating category", err: err.message });
  }
};


export const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  try {
    if (!["admin", "superadmin"].includes(req.user.role)) {
      return res.status(403).json({ message: "Admins only!" });
    }

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found!" });
    }

    // Update name & slug if name changed
    if (name && name !== category.name) {
      let baseSlug = slugify(name, { lower: true, strict: true });
      let slug = baseSlug;
      let counter = 2;

      while (await Category.findOne({ slug })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      category.name = name;
      category.slug = slug;
    }

    // Update description if provided
    if (description !== undefined) {
      category.description = description;
    }

    await category.save();

    return res.status(200).json({ message: "Category updated successfully!", category });
  } catch (err) {
    console.error("Error updating category:", err);
    res.status(500).json({ message: "Error updating category", err: err.message });
  }
};


export const deleteCategory = async (req, res) => {
  const { id } = req.params;

  try {
    if (req.user.role !== "admin" && req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Admins only!" });
    }

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found!" });
    }
    // Find category and delete
    await Category.findByIdAndDelete(id);

    return res.status(200).json({ message: "Category deleted successfully!" });
  } catch (err) {
    console.error("Error deleting category:", err);
    res.status(500).json({ message: "Error deleting category", err: err.message });
  }
};

// Get all categories
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find();

    res.status(200).json({ message: "Categories fetched successfully", categories });
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).json({ message: "Error fetching categories", err: err.message });
  }
};

// Get category by ID
export const getCategoryById = async (req, res) => {
  const { id } = req.params;
  
  try {
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    
    res.status(200).json({ message: "Category fetched successfully", category });
  } catch (err) {
    console.error("Error fetching category:", err);
    res.status(500).json({ message: "Error fetching category", err: err.message });
  }
};

