import { Router } from 'express';
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart } from '../controllers/users/barrel.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const cartRouter = Router();

cartRouter
      .get('/cart', authMiddleware, getCart)
      .post('/cart', authMiddleware, addToCart)
      .patch('/cart/items/:itemId', authMiddleware, updateCartItem)
      .delete('/cart/items/:itemId', authMiddleware, removeFromCart) 
      .delete('/cart/clear', authMiddleware, clearCart) 
      



export default cartRouter;
      