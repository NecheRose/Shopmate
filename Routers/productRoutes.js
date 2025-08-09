import { Router } from 'express';
import { getProducts, getCategories, getProductById } from '../controllers/users/barrel.js';

const productRouter = Router();

productRouter
       // Route for both Users and Admin
      .get('/', getProducts) // filter by products, productId, all categories, categoryId keyword)
      .get('/categories', getCategories) // Gets all categories and by id
      .get('/:id', getProductById) // Single product details
      
      
      
      



export default productRouter;
      