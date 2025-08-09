import express from 'express';
import { adminRouter, authRouter, cartRouter, orderRouter, productRouter, userRouter} from './Routers/barrel.js';
import { connectDB } from './mongodb/mongodb.js';
import dotenv from 'dotenv';



dotenv.config(); 

const app = express();

connectDB();

// Middleware to parse JSON body and urlencoded form data
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 


// Routes
app.use('/api/admin', adminRouter);
app.use('/api/auth', authRouter);
app.use('/api/cart', cartRouter);
app.use('/api/orders', orderRouter);
app.use('/api/products', productRouter);
app.use('/api/users', userRouter);


const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});