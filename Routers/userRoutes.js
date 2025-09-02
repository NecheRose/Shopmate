import { Router } from "express";
import { getUserProfile, updateUserProfile, changePassword, deleteUserAccount } from "../controllers/users/barrel.js";
import { getAllUsers, getUserById } from "../controllers/admin/barrel.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { adminOrSuperadminOnly } from "../middlewares/adminMiddleware.js";

const userRouter = Router();

userRouter
      .get('/me', authMiddleware, getUserProfile)
      .patch('/me/update-profile', authMiddleware, updateUserProfile)
      .post('/me/change-password', authMiddleware, changePassword)
      .delete('/me', authMiddleware, deleteUserAccount) 
      // Admin only
      .get('/', authMiddleware, adminOrSuperadminOnly, getAllUsers)
      .get('/:id', authMiddleware, adminOrSuperadminOnly, getUserById) 


      

export default userRouter;
      