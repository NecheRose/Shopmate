import { Router } from "express";
import { createOrder, getMyOrders, cancelOrder } from "../controllers/users/barrel.js";
import { getAllOrders, getUserOrders, updateOrderStatus } from "../controllers/admin/barrel.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { adminOrSuperadminOnly } from "../middlewares/adminMiddleware.js";

const orderRouter = Router();

orderRouter
      .post('/checkout', authMiddleware, createOrder)
      .get('/my-orders', authMiddleware, getMyOrders) 

      // Admin-only
      .get('/all', authMiddleware, adminOrSuperadminOnly, getAllOrders) 
      .get('/:userId', authMiddleware, adminOrSuperadminOnly, getUserOrders) 
      .patch('/:id/status', authMiddleware, adminOrSuperadminOnly, updateOrderStatus)  

      // Both user + admin (user cancels their own order, admin can too if needed)
      .patch('/:id/cancel', authMiddleware, cancelOrder) 


export default orderRouter;
      