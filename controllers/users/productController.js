import Product from "../../models/productSchema.js";



export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("category", "name") 
      .sort({ createdAt: -1 }); // newest first

    return res.status(200).json({ products });
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ message: "Error fetching products", err: err.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id).populate("category", "name description"); 

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ product });
  } catch (err) {
    console.error('Error fetching product:', err);
    res.status(500).json({ message: 'Error fetching product', err: err.message });
  }
};


