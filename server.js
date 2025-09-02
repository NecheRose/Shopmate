import express from "express";
import dotenv from "dotenv";
import { adminRouter, authRouter, cartRouter, categoryRouter, orderRouter, paymentRouter, productRouter, userRouter } from "./Routers/barrel.js";
import { connectDB } from "./lib/mongodb.js";
import { connectRedis } from "./lib/redis.js";
import cookieParser from "cookie-parser";


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000

// Connect database
connectDB();      
connectRedis();   

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// API routes
app.use('/api/admin', adminRouter);
app.use('/api/auth', authRouter);
app.use('/api/cart', cartRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/orders', orderRouter);
app.use('/api/payments', paymentRouter);
app.use('/api/products', productRouter);
app.use('/api/users', userRouter);

// Start server
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));