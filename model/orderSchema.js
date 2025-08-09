import mongoose from 'mongoose';
import { cartItemSchema } from './cartSchema.js';

// Sub-schema for consistency and prevent missing fields
export const addressSchema = new mongoose.Schema({
  street:  { type: String, required: true },
  city:    { type: String, required: true },
  state:   { type: String, required: true },
  country: { type: String, required: true }
}, { _id: false });

const orderSchema =  new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: { type: [cartItemSchema], required: true },
  totalOrderPrice: { type: Number, required: true },
  deliveryAddress: { type: addressSchema, required: true },
  paymentMethod: { type: String, enum: ['card', 'bank', 'cash on delivery'], default: 'card', required: true },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  orderStatus: { type: String, enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'pending' }
}, { timestamps: true});

export const Order = mongoose.model('Order', orderSchema);

