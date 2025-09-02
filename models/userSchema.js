import mongoose from "mongoose";
import { addressSchema } from "./orderSchema.js";

// Sub-schema for profile so that address is validated and not hardcorded twice
const profileSchema = new mongoose.Schema({
  phoneNumber: { type: String }, 
  deliveryAddress: addressSchema
}, { _id: false });


const userSchema =  new mongoose.Schema({
  // Basic user information
  fullName: { type: String },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  profile: { type: profileSchema, default: {} } ,
  role: { type: String, enum: ["user", "admin", "superadmin"], default: "user"},
  isVerified: { type: Boolean, default: false }, // For email verification
  verificationToken: { type: String, default: null }, // For email verification links
  verificationTokenExpires: Date,
  lastVerificationSentAt: Date, 
  refreshToken: String,
  refreshTokenExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  passwordChangedAt: Date
}, { timestamps: true }); // Adds createdAt and updatedAt automatically

const User = mongoose.model("User", userSchema);

export default User;

