import { Router } from 'express';
import { registerUser, loginUser, logoutUser, verifyEmail, resendVerification, requestPasswordReset, resetPassword, refreshAccessToken} from '../controllers/users/barrel.js';

const authRouter = Router();


authRouter
      // Authentication
      .post('/register', registerUser)
      .post('/login', loginUser)
      .post('/logout', logoutUser)
      .post('/auth/refresh-token', refreshAccessToken) 

      // Email Verification
      .get('/email/verify', verifyEmail) 
      .post('/email/resend-verification', resendVerification)

      // Password Reset 
      .post('/forgot-password', requestPasswordReset)
      .post('/auth/reset-password', resetPassword)
      



export default authRouter;
      