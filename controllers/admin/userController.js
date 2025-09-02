import mongoose from "mongoose";
import User from "../../models/userSchema.js";
import validator from "validator";
import bcrypt from "bcryptjs";
import {sendMail, successfulAdminCreation} from "../../services/emailService.js";


// superadmin only
export const createAdmin = async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;

    // Validations
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All input fields are required" })
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Invalid email format. Please check your input." });
    }
  
    if (!validator.isLength(password, { min: 6 })) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }
  
    // Only superadmin can create admins
    if (req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Access denied" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new User({
      fullName,
      email,
      password: hashedPassword,
      role: role || "admin",
    });

    await newAdmin.save();

    // Success email to admin 
    await sendMail(successfulAdminCreation(email, fullName, password))

    return res.status(201).json({
      message: "Admin created successfully",
      admin: {
        fullName: newAdmin.fullName,
        email: newAdmin.email,
        role: newAdmin.role,
      },
    });
  } catch (err) {
    console.error("Error creating admin:", err)
    res.status(500).json({ message: "Admin creation failed", err: err.message });
  }
};


// Get all users in the database
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    if (users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    return res.json(users);
  } catch (err) {
    console.error("Error getting users:", err);
    res.status(500).json({ message: "Error getting users", err: err.message });
  }
};

// View user profile
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "User ID not provided" });
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await User.findById(id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ user });
  } catch (err) {
    console.error("Error getting user:", err);
    return res.status(500).json({ message: "Error getting user", err: err.message });
  }
};



