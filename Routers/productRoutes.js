import { Router } from "express";
import { createProduct, updateProduct, deleteProduct, addVariants,updateVariant, deleteVariant} from "../controllers/admin/barrel.js"; 
import { upload } from "../middlewares/multer.js";
import { getAllProducts, getProductById } from "../controllers/users/barrel.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import {adminOrSuperadminOnly} from "../middlewares/adminMiddleware.js";

const productRouter = Router();

productRouter
      .post('/create', authMiddleware, adminOrSuperadminOnly, upload.array('images', 5), createProduct)
      .patch('/:id', authMiddleware, adminOrSuperadminOnly, upload.array('images', 5), updateProduct) 
      .delete('/:id', authMiddleware, adminOrSuperadminOnly, deleteProduct) 
      .post('/:productId/variants', authMiddleware, adminOrSuperadminOnly,   upload.array('images', 5), addVariants)
      .patch('/:productId/:variantId', authMiddleware, adminOrSuperadminOnly, upload.array('images', 5), updateVariant)
      .delete('/:productId/:variantId', authMiddleware, adminOrSuperadminOnly, deleteVariant)
      // Route for both Users and Admins
      .get('/', getAllProducts) 
      .get('/:id', getProductById) 


export default productRouter;
      