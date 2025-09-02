import { Router } from "express";
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart } from "../controllers/users/barrel.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const cartRouter = Router();


cartRouter
      .get('/', authMiddleware, getCart)

      // Clear entire cart 
      .delete('/clear', authMiddleware, clearCart)

      // Add to cart
      .post('/:productId', authMiddleware, addToCart)   // product without variant
      .post('/:productId/:variantId', authMiddleware, addToCart) // product with variant

      // Update cart item
      .patch('/:productId', authMiddleware, updateCartItem)     // without variant
      .patch('/:productId/:variantId', authMiddleware, updateCartItem) // with variant

      // Remove single item
      .delete('/:productId', authMiddleware, removeFromCart)   // without variant
      .delete('/:productId/:variantId', authMiddleware, removeFromCart) // with variant


export default cartRouter;