import Product from "../../models/productSchema.js";
import Category from "../../models/categorySchema.js";
import cloudinary from "../../lib/cloudinary.js";


// Product creation without variants
export const createProduct = async (req, res) => {
  try {
    let { productName, category, description, price, quantity, hasVariants } = req.body;

    // Role check
     if (!["admin", "superadmin"].includes(req.user.role)) {
      return res.status(403).json({ message: "Admins only!" });
    }

    if (!productName || !description) {
      return res.status(400).json({ message: "Product name and description are required" });
    }

    // Require at least one image
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "At least one product image is required" });
    }

    // Parse category if it’s a stringified array
    if (typeof category === "string") {
      try {
        category = JSON.parse(category);
      } catch (err) {
        return res.status(400).json({ message: "Invalid category format" });
      }
    }

    // Validate categories exist
    if (category && category.length > 0) {
      const existingCategories = await Category.find({ _id: { $in: category } });
      if (existingCategories.length !== category.length) {
        return res.status(400).json({ message: "Some category IDs are invalid" });
      }
    }

    // Upload images to Cloudinary
    const uploadedImages = [];

    for (const file of req.files) {
      await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "products" },
          (error, result) => {
            if (error) return reject(error);
            uploadedImages.push({
              url: result.secure_url,
              publicId: result.public_id,
            });
            resolve();
          }
        );
        uploadStream.end(file.buffer);
      });
    }

    // Ensure hasVariants is a boolean
    hasVariants = hasVariants === "true" || hasVariants === true;

    // Validation depending on hasVariants
    if (!hasVariants) {
      if (price == null || quantity == null) {
        return res.status(400).json({ message: "Price and quantity are required for single-price products" });
      }
    } 

    // Create product
    const product = new Product({
      productName,
      category,
      description,
      price: hasVariants ? undefined : price,
      quantity: hasVariants ? undefined : quantity,
      hasVariants,
      images: uploadedImages,
    });  

    await product.save();

    return res.status(201).json({ message: "Product created successfully", product });
  } catch (err) {
    console.error("Error creating product:", err);
    res.status(500).json({ message: "Error creating product", err: err.message });
  };
}

// Update product
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { productName, category, description, price, quantity, hasVariants, imagesToRemove } = req.body;

    if (!["admin", "superadmin"].includes(req.user.role)) {
      return res.status(403).json({ message: "Admins only!" });
    }

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Validate categories
    if (category) {
      const existingCategories = await Category.find({ _id: { $in: category } });
      if (existingCategories.length !== category.length) {
        return res.status(400).json({ message: "Some category IDs are invalid" });
      }
      product.category = category;
    }

    // Basic field updates
    if (productName) product.productName = productName;
    if (description) product.description = description;
    if (hasVariants !== undefined) product.hasVariants = hasVariants;

    // Update price/quantity
    if (product.hasVariants) {
      product.price = undefined;
      product.quantity = undefined;
    } else {
      if (price !== undefined) product.price = price;
      if (quantity !== undefined) product.quantity = quantity;
    }

    // Remove selected images
    if (imagesToRemove && Array.isArray(imagesToRemove)) {
      for (const publicId of imagesToRemove) {
        await cloudinary.uploader.destroy(publicId); // delete from Cloudinary
        product.images = product.images.filter(img => img.publicId !== publicId); // remove from DB
      }
    }

    // New uploads (keep old ones)
        const uploadedImages = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: "products" },
            (error, result) => {
              if (error) return reject(error);
              uploadedImages.push({
                url: result.secure_url,
                publicId: result.public_id,
              });
              resolve();
            }
          );
          uploadStream.end(file.buffer);
        });
      }
      product.images.push(...uploadedImages); // keep old ones and add new
    }

    // Enforce at least 1 image only if images are being updated
    const isUpdatingImages = (imagesToRemove && imagesToRemove.length > 0) || (req.files && req.files.length > 0);

    if (isUpdatingImages && (!product.images || product.images.length < 1)) {
      return res.status(400).json({ message: "A product must have at least 1 image" });
    }

    await product.save();

    res.status(200).json({ message: "Product updated successfully", product });
  } catch (err) {
    console.error("Error updating product:", err);
    res.status(500).json({ message: "Error updating product", err: err.message });
  }
};


// Delete product
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!["admin","superadmin"].includes(req.user.role)) {
      return res.status(403).json({ message: "Admins only!" });
    }

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Delete product images
    if (product.images && product.images.length > 0) {
      for (const img of product.images) {
        await cloudinary.uploader.destroy(img.publicId);
      }
    }

    await product.deleteOne();

    res.status(200).json({ message: "Product and images deleted successfully" });
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json({ message: "Error deleting product", err: err.message });
  }
};


// Add variants to products
export const addVariants = async (req, res) => {
  try {
    const { productId } = req.params;
    const { price, quantity } = req.body;

    if (!["admin", "superadmin"].includes(req.user.role)) {
      return res.status(403).json({ message: "Admins only!" });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Validate price & quantity
    if (price == null || quantity == null) {
      return res.status(400).json({ message: "Price and quantity are required" });
    }

    // Parse attributes from form-data
    let attributes = [];
    if (req.body.attributes) {
      try {
        attributes = JSON.parse(req.body.attributes);
      } catch (err) {
        return res.status(400).json({ message: "Invalid JSON format for attributes" });
      }
    }

    // Validate attributes
    if (!Array.isArray(attributes) || !attributes.length ||
      !attributes.every(attr => typeof attr?.key === "string" && typeof attr?.value === "string")) {
      return res.status(400).json({
        message: "Attributes must be a non-empty array of key-value string pairs"
      });
    }

    // Normalize attributes
    const normalizeAttrs = arr => arr
      .map(a => ({ key: a.key.trim().toLowerCase(), value: a.value.trim().toLowerCase() }))
      .sort((a, b) => a.key.localeCompare(b.key) || a.value.localeCompare(b.value));

    const normalizedAttributes = normalizeAttrs(attributes);

    // Prevent duplicate variants
    if (product.variants.some(
      v => JSON.stringify(normalizeAttrs(v.attributes)) === JSON.stringify(normalizedAttributes)
    )) {
      return res.status(400).json({ message: "Duplicate attributes" });
    }

    // Convert product to multi-variant if not already
    if (!product.hasVariants) {
      product.hasVariants = true;
      product.price = undefined;
      product.quantity = undefined;
    }

    // Enforce at least one image upload
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "At least one image is required for a variant" });
    }

    // Upload images
    let uploadedImages = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "variants" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          stream.end(file.buffer);
        });
        uploadedImages.push({ url: result.secure_url, publicId: result.public_id });
      }
    }

    // Add variant
    product.variants.push({
      attributes: normalizedAttributes,
      price,
      quantity,
      images: uploadedImages
    });

    await product.save();

    res.status(201).json({ message: "Variant added successfully", product });
  } catch (err) {
    console.error("Error adding variant:", err);
    res.status(500).json({ message: "Error adding variant", err: err.message });
  }
};


// Update variant
export const updateVariant = async (req, res) => {
  try {
    const { productId, variantId } = req.params;
    const { attributes, price, quantity, images } = req.body; 

    if (!["admin", "superadmin"].includes(req.user.role)) {
      return res.status(403).json({ message: "Admins only!" });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Find variant by ID
    const variant = product.variants.id(variantId);
    if (!variant) return res.status(404).json({ message: "Variant not found" });

    // Attribute update 
    if (attributes) {
      if (
        !Array.isArray(attributes) ||
        !attributes.length ||
        !attributes.every((attr) => typeof attr?.key === "string" && typeof attr?.value === "string")
      ) {
        return res.status(400).json({
          message: "Attributes must be a non-empty array of key-value string pairs",
        });
      }

      // normalize attributes for easy comparison
      const normalizeAttrs = (arr) =>
        arr
          .map((a) => ({
            key: a.key.trim().toLowerCase(),
            value: a.value.trim().toLowerCase(),
          }))
          .sort((a, b) => a.key.localeCompare(b.key) || a.value.localeCompare(b.value));

      const existing = normalizeAttrs(variant.attributes);
      const incoming = normalizeAttrs(attributes);

      // Replace if exists, otherwise add
      for (const attr of incoming) {
        const index = existing.findIndex((a) => a.key === attr.key);
        if (index !== -1) {
          existing[index] = attr; // replace existing value
        } else {
          existing.push(attr); 
        }
      }

      const normalizedAttributes = normalizeAttrs(existing);

      // Duplicate check against other variants
      const isSameAttributes = (a, b) => {
        if (a.length !== b.length) return false;
        return a.every((attr, i) => attr.key === b[i].key && attr.value === b[i].value);
      };

      const hasDuplicate = product.variants.some(
        (v) =>
          v._id.toString() !== variantId &&
          isSameAttributes(normalizeAttrs(v.attributes), normalizedAttributes)
      );

      if (hasDuplicate) {
        return res.status(400).json({ message: "Duplicate attributes with another variant" });
      }

      variant.attributes = normalizedAttributes;
    }

    // price update 
    if (price != null) {
      variant.price = price;
    }

    // quantity update 
    if (quantity != null) {
      variant.quantity = quantity;
    }

    // Ensure images are >= 1
    if (images) {
      if (!Array.isArray(images) || images.length < 1) {
        return res.status(400).json({ message: "Variant must have at least 1 image" });
      }

      // Delete old images from Cloudinary
      if (variant.images && variant.images.length > 0) {
        for (const img of variant.images) {
          await cloudinary.uploader.destroy(img.publicId);
        }
      }
      variant.images = images;
    }

    // Tell Mongoose the subdocument array was modified
    product.markModified("variants");

    await product.save();

    res.status(200).json({ message: "Variant updated successfully", variant });
  } catch (err) {
    console.error("Error updating variant:", err);
    res.status(500).json({ message: "Error updating variant", err: err.message });
  }
};


// Delete variant
export const deleteVariant = async (req, res) => {
  try {
    const { productId, variantId } = req.params;

    if (!["admin", "superadmin"].includes(req.user.role)) {
      return res.status(403).json({ message: "Admins only!" });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const variant = product.variants.id(variantId);
    if (!variant) return res.status(404).json({ message: "Variant not found" });

    // Delete only this variant’s images
    if (variant.images && variant.images.length > 0) {
      for (const img of variant.images) {
        await cloudinary.uploader.destroy(img.publicId);
      }
    }

    // Delete the variant
    variant.deleteOne();

    // If no variants left, reset product flags
    if (product.variants.length === 0) {
      product.hasVariants = false;
      product.price = undefined;
      product.quantity = undefined;
    }

    await product.save();

    res.status(200).json({ message: "Variant deleted successfully", product });
  } catch (err) {
    console.error("Error deleting variant:", err);
    res.status(500).json({ message: "Error deleting variant", err: err.message });
  }
};

