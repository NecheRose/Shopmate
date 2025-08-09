import mongoose from 'mongoose';


export const cartItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, default: 1, min: 1 },
  price: { type: Number, required: true },
  totalItemPrice: { type: Number, required: true, min: 0 }, // Price of each item
}, { _id: false });

const cartSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    products: {type: [cartItemSchema], default: [] },
    totalCartPrice: { type: Number, default: 0 } // Addition of totalItemPrice of each product in the array(cart)  }
}, { timestamps: true });

export const Cart = mongoose.model('Cart', cartSchema);

