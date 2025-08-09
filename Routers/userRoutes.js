import { Router } from 'express';
import { getAllCategories, getCategoryById, getUserProfile, updateUserProfile, changePassword, deleteUserAccount } from '../controllers/users/barrel.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const userRouter = Router();

userRouter
      // Routes for only authenticated users
      .get('/me', authMiddleware, getUserProfile)
      .put('/me/update-profile', authMiddleware, updateUserProfile)
      .put('/me/change-password', authMiddleware, changePassword)
      .delete('/me', authMiddleware, deleteUserAccount) 

      
      


export default userRouter;
      