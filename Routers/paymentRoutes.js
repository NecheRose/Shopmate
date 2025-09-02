import { Router } from "express";
import { initializePayment, verifyPayment } from "../services/paymentService.js";

const paymentRouter = Router();


paymentRouter
      .post('/initialize', initializePayment)
      .get('/verify/:reference', verifyPayment)

export default paymentRouter;
