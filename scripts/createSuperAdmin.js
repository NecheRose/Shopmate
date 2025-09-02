import { connectDB } from "../lib/mongodb.js";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/userSchema.js";
import { transporter } from "../services/emailService.js";


// Node.js script to create the first superadmin
async function createAdmin() {
  try {
    // Collect arguments
    const [, , fullName, email, password] = process.argv;

    if (!fullName || !email || !password) {
      console.log("❌ Please provide fullName, email, and password");
      console.log("👉 Example: node scripts/createSuperAdmin.js \"Rose Kalu\" rose@example.com StrongPass123");
      process.exit(1);
    }

    // Connect to MongoDB
    await connectDB();

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
      console.log(`Admin with email '${email}' already exists.`);
      return;
    }

    // Password hashing    
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new admin
    const newAdmin = new User({
      fullName,
      email,
      password: hashedPassword,
      role: "superadmin",
      isVerified: true   // Skip email verification
    });

    // Save admin
    await newAdmin.save();

    console.log("Superadmin created successfully!");

    // Optional: Send email verification
    if (process.env.EMAIL_USER) {
      try {
        await transporter.sendMail({
          from: `"Shopmate Team" <${process.env.EMAIL_USER}>`,
          to: newAdmin.email,
          subject: "Welcome to Shopmate as Superadmin",
          html: `
            <h2>Hi ${newAdmin.fullName},</h2>
            <p>Congratulations! You have been granted <strong>Superadmin</strong> access to Shopmate.</p>
            <p>You now have full control over the platform, including managing admins, products, and user roles.</p>
            <p>Please keep your credentials safe and secure.</p>`
        });
        console.log("Superadmin email sent!");
      } catch (err) {
        console.error("Error sending email:", err.message);
      }
    }
  } catch (error) {
    console.error("Error creating superadmin:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("Database connection closed");
    process.exit(0);
  }
}

createAdmin();