import mongoose from 'mongoose';
import { addressSchema } from './orderSchema.js';

// Sub-schema for profile so that address is validated and not hardcorded twice
const profileSchema = new mongoose.Schema({
  phoneNumber: { type: String, default: ''}, 
  address: addressSchema
}, { _id: false });


const userSchema =  new mongoose.Schema({
  // Basic user information
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  // Profile details
  profile: profileSchema,
  // Role & status
  role: { type: String, enum: ['user', 'admin'], default: 'user'},
  isVerified: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
  // OTP management
  otp: String,
  otpExpires: Date,
  lastOtpSentAt: Date, 
  // Password recovery & security
  passwordResetToken: String,
  passwordResetExpires: Date,
  passwordChangedAt: Date,
}, { timestamps: true }); // Adds createdAt and updatedAt automatically

export const User = mongoose.model('User', userSchema);

