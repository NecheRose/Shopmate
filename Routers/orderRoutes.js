import { Router } from 'express';
import { createOrder, getMyOrders, cancelOrder } from '../controllers/users/barrel.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const orderRouter = Router();

orderRouter
      .post('/orders/checkout', authMiddleware, createOrder)
      .get('/orders', authMiddleware, getMyOrders)
      .patch('/orders/:id/cancel', authMiddleware, cancelOrder) 
      



export default orderRouter;
      