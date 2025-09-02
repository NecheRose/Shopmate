import { Router } from "express";
import {createAdmin} from "../controllers/admin/barrel.js";
import {authMiddleware} from "../middlewares/authMiddleware.js";
import {superadminOnly} from "../middlewares/adminMiddleware.js";


const adminRouter = Router();

adminRouter
    // Only superadmins can create admins
    .post('/create-admin', authMiddleware, superadminOnly, createAdmin)

    
    


export default adminRouter;
     
