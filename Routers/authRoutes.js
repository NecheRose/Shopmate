import { Router } from "express";
import { registerUser, verifyEmail, resendVerificationLink, loginUser, logoutUser, passwordResetRequest, passwordReset, refreshAccessToken} from "../controllers/users/barrel.js";
import { loginLimiter } from "../middlewares/authMiddleware.js";

const authRouter = Router();


authRouter
      // Authentication
      .post('/register', registerUser)
      .post('/login', loginLimiter, loginUser)
      .post('/logout', logoutUser)
      .post('/refresh-token', refreshAccessToken) 

      // Email Verification
      .get('/verify-email', verifyEmail) 
      .post('/resend-verification', resendVerificationLink)

      // Password Reset 
      .post('/forgot-password', passwordResetRequest)
      .post('/reset-password', passwordReset)
      



export default authRouter;
      