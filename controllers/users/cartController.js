import Cart from "../../models/cartSchema.js";
import Product from "../../models/productSchema.js";




// Get Cart
export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id }).populate("products.productId");

    if (!cart || cart.products.length === 0) {
      return res.status(200).json({ 
        message: "Cart is empty", 
        cart: { products: [], totalCartPrice: 0 }
      });
    }

    // Format products so only chosen variant is shown
    const formattedProducts = cart.products.map(item => {
      let product = item.productId ? item.productId.toObject() : null;

      if (!product) return item; // in case product is deleted

      // Ensure only the variantId chosen will be added
      if (product.variants && product.variants.length > 0 && item.variantId) {
        const chosenVariant = product.variants.find(
          v => v._id.toString() === item.variantId.toString()
        );

        return {
          ...item.toObject(),
          productId: {
            ...product,
            variants: chosenVariant ? [chosenVariant] : undefined
          }
        };
      }

      // Remove variant field for products without variants
      const { variants, ...productWithoutVariants } = product;

      return {
        ...item.toObject(),
        productId: productWithoutVariants
      };
    });

    // Recalculate total cart price
    const totalCartPrice = formattedProducts.reduce((sum, item) => sum + item.totalItemPrice, 0);

    res.status(200).json({
      message: "Cart fetched successfully",
      cart: { ...cart.toObject(),
        products: formattedProducts,
        totalCartPrice
      }
    });
  } catch (err) {
    console.error("Error getting cart:", err)
    res.status(500).json({ message: "Error getting cart", err: err.message});
  }
};


// Add to Cart
export const addToCart = async (req, res) => {
  try {
    const { productId, variantId } = req.params;
    const { quantity } = req.body;

    const qty = Number(quantity);
    if (!qty || qty < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    // Fetch product
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Determine price 
    let price = product.price;
    if (variantId) {
      const chosenVariant = product.variants.find(
        v => v._id.toString() === variantId.toString()
      );
      if (!chosenVariant) {
        return res.status(404).json({ message: "Variant not found" });
      }
      price = chosenVariant.price;
    }

    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      cart = new Cart({ 
        userId: req.user._id, 
        products: [] 
      });
    }

    // Check if product (with or without variant) already exists
    const existingItem = cart.products.find(item =>
      item.productId?.toString() === productId.toString() &&
      (variantId ? item.variantId?.toString() === variantId.toString() : !item.variantId)
    );

    if (existingItem) {
      existingItem.quantity += qty;
      existingItem.totalItemPrice = existingItem.price * existingItem.quantity;
    } else {
      cart.products.push({
        productId: product._id,
        variantId: variantId || null,
        quantity: qty,
        price,
        totalItemPrice: price * qty
      });
    }

    // Recalculate total cart price
    cart.totalCartPrice = cart.products.reduce((acc, item) => acc + item.totalItemPrice, 0);

    await cart.save();

    // Enrich cart response with product + variant details
    const enrichedCart = {
      ...cart.toObject(),
      products: await Promise.all(
        cart.products.map(async (item) => {
          const product = await Product.findById(item.productId);

          let variantDetails = null;

          if (item.variantId) {
            const variant = product.variants.id(item.variantId);

            if (variant) {
              variantDetails = {
                variantId: variant._id,
                attributes: variant.attributes,
                images: variant.images
              };
            }
          }

          return {
            ...item.toObject(),
            name: product.productName,
            thumbnail: product.images?.[0]?.url || null,
            variant: variantDetails
          };
        })
      )
    };

    return res.status(200).json({ message: "Product added to cart", enrichedCart });
  } catch (err) {
    console.error("Error adding to cart:", err);
    return res.status(500).json({ message: "Error adding to cart", err: err.message });
  }
};

// Update Cart Items
export const updateCartItem = async (req, res) => {
  try {
    const { productId, variantId } = req.params;
    const { type } = req.body;

    // Validate type
    if (!type || !["increase", "decrease"].includes(type)) {
      return res.status(400).json({ message: "Type must be 'increase' or 'decrease'" });
    }

    // Find cart
    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found for this user" });

    // Find item in cart
    const item = cart.products.find(item => {
      const matchProduct = String(item.productId) === String(productId);
      const matchVariant = variantId ? String(item.variantId) === String(variantId) : !item.variantId;

      return matchProduct && matchVariant;
    });

    if (!item) return res.status(404).json({ message: "Item not found in cart" });

    // Fetch full product doc
    const product = await Product.findById(item.productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Stock + variant data
    let availableStock;
    let variantData = null;

    if (item.variantId) {
      const variant = product.variants.id(item.variantId); 
      if (!variant) return res.status(404).json({ message: "Variant not found" });

      availableStock = variant.quantity;

      variantData = {
        _id: variant._id,
        attributes: variant.attributes,
        images: variant.images,
        price: variant.price,
        quantity: variant.quantity,
      };
    } else {
      availableStock = product.quantity;
    }

    // Apply change
    const change = type === "increase" ? 1 : -1;

    const newQuantity = item.quantity + change;

    if (type === "increase" && newQuantity > availableStock) {
      return res.status(400).json({
        message: `Cannot increase quantity. Only ${availableStock} item(s) available in stock.`,
      });
    }

    // If the new quantity drops below 1, remove the item entirely from the cart
    if (newQuantity < 1) {
      cart.products = cart.products.filter(i => i !== item);
    } else {
      // Otherwise, update the quantity and recalculate the total price for that item
      item.quantity = newQuantity;
      item.totalItemPrice = item.price * item.quantity;
    }

    // Recalculate total
    cart.totalCartPrice = cart.products.reduce((sum, item) => sum + item.totalItemPrice, 0);

    await cart.save();

    // Populate productName, images, and attach variant manually
    await cart.populate({
      path: "products.productId",
      select: "productName images price quantity variants",
    });

    // Attach variant details if exists
    const cartWithVariants = cart.toObject();

    cartWithVariants.products = cartWithVariants.products.map(product => {
      if (product.variantId && product.productId?.variants) {
        const variant = product.productId.variants.find(
          v => v._id.toString() === product.variantId.toString()
        );

        if (variant) {
          return {
            ...product,
            productId: {
              _id: product.productId._id,
              productName: product.productId.productName,
              images: product.productId.images,
            },
            variant: {
              _id: variant._id,
              attributes: variant.attributes,
              images: variant.images,   
              price: variant.price,
              quantity: variant.quantity,
            }
          };
        }
      }

      // If product has no variant
      return {
        ...product,
        productId: {
          _id: product.productId._id,
          productName: product.productId.productName,
          images: product.productId.images,
        }
      };
    });

    return res.status(200).json(cartWithVariants);
  } catch (err) {
    console.error("Error updating cart:", err);
    res.status(500).json({ message: "Cart update failed" });
  }
};


// Remove specific Items from Cart
export const removeFromCart = async (req, res) => {
  try {
    const { productId, variantId } = req.params;

    // Find user's cart
    const cart = await Cart.findOne({ userId: req.user._id });
    
    // Remove matching product (with or without variant)
    cart.products = cart.products.filter(item => {
      const sameProduct = item.productId.toString() === productId;
      const sameVariant = variantId
        ? String(item.variantId) === String(variantId)
        : !item.variantId; // matches only non-variant items if no variantId

      return !(sameProduct && sameVariant);
    });

    // Recalculate total cart price
    cart.totalCartPrice = cart.products.reduce((sum, item) => sum + item.totalItemPrice, 0 );

    await cart.save();
    
    return res.status(200).json("Product removed successfully", cart);
  } catch (err) {
    console.error("Error removing items from cart:", err);
    res.status(500).json({ message: "Error removing items from cart", err: err.message });
  }
};


// Clear all cart items
export const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // empty cart
    cart.products = [];
    cart.totalCartPrice = 0;

    await cart.save();

    return res.status(200).json({ message: "Cart is empty", cart });
  } catch (err) {
    console.error("Error clearing cart:", err);
    return res.status(500).json({ message: "Error clearing cart", err: err.message });
  }
};
