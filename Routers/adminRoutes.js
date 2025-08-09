import { Router } from 'express';
import {getAllUsers, getUserById, createProduct, updateProduct, deleteProduct, addVariant, updateVariant, deleteVariant, createCategory, updateCategory, deleteCategory, getAllOrders, updateOrderStatus} from '../controllers/admin/barrel.js';
import adminMiddleware from './middlewares/adminMiddleware.js';

const adminRouter = Router();

adminRouter
      .use(adminMiddleware) // Globally applies to all routes below
    // User Management
      .get('/users', getAllUsers)
      .get('/users/:id', getUserById) 
    // Product Management
      .post('/products', createProduct)
      .put('/products/:id', updateProduct) 
      .delete('/products/:id', deleteProduct)
      .post('/categories', createCategory)
      .put('/categories/:id', updateCategory) 
      .delete('/categories/:id', deleteCategory)  
      .post('/products/:id/variants', addVariant)
      .put('/products/:id/variants/:variantId', updateVariant)
      .delete('/products/:id/variants/:variantId', deleteVariant)
    // Order Management
      .get('/orders', getAllOrders) 
      .patch('/orders/:id', updateOrderStatus) 
   
        

export default adminRouter;
      