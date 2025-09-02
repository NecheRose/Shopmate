import { Router } from "express";
import { createCategory, updateCategory, deleteCategory, getCategories, getCategoryById} from "../controllers/admin/categoryController.js";
import {authMiddleware} from "../middlewares/authMiddleware.js";
import { adminOrSuperadminOnly } from "../middlewares/adminMiddleware.js";

const categoryRouter = Router();

categoryRouter
    .post('/create', authMiddleware, adminOrSuperadminOnly, createCategory)
    .patch('/:id', authMiddleware, adminOrSuperadminOnly, updateCategory) 
    .delete('/:id', authMiddleware, adminOrSuperadminOnly, deleteCategory) 
    .get('/', getCategories)
    .get('/:id', getCategoryById)

export default categoryRouter;