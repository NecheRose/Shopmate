import User from "../../models/userSchema.js";
import Cart from "../../models/cartSchema.js"; 
import validator from "validator";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { sendMail, verifyAccountEmail, successfulVerificationEmail, successfulLoginEmail, passwordResetEmail, successfulPasswordReset } from "../../services/emailService.js";
import { generateAccessToken, generateRefreshToken, setCookies, storeRefreshToken } from "../../utils/tokenManagement.js";
import { client } from "../../lib/redis.js";




// User registration
export const registerUser = async (req, res) => {
  const { fullName, email, password, confirmPassword, role } = req.body;

  if (!fullName || !email || !password || !confirmPassword) {
    return res.status(400).json({ message: "All input fields are required" });
  }

  // Check email format
  if (!validator.isEmail(email)) {
    return res.status(400).json({ message: "Invalid email format. Please check your input." });
  }

  // Validate password length
  if (!validator.isLength(password, { min: 6 })) {
    return res.status(400).json({ message: "Password must be at least 6 characters long" });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists." });
    }

    // Password hashing
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate secure token and expiry
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = Date.now() + 30 * 60 * 1000; // 30 minutes

    // Create user
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      role: role || "user",
      isVerified: false,
      verificationToken,
      verificationTokenExpires: tokenExpiry
    });

    await newUser.save();

    // Send verification link to user email
    await sendMail(verifyAccountEmail(email, verificationToken));

    return res.status(201).json({
      message: "Registration successful. Please check your email to verify your account."
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "User registration failed", err: err.message });
  }
};


// Verify Email
export const verifyEmail = async (req, res) => {
  const { verificationToken } = req.query;

  try {
    const user = await User.findOne({ verificationToken });

    // If token not linked to any user
    if (!user) {
      return res.status(400).json({ message: "Invalid verification token" });
    }

    // Check if already verified
    if (user.isVerified) {
      return res.status(400).json({ message: "User is already verified." });
    }

    // Check for expired token 
    if (user.verificationTokenExpires && user.verificationTokenExpires < Date.now()) {
      return res.status(400).json({ message: "Verification token has expired" });
    }

    // Verify user
    user.isVerified = true;
    user.verificationToken = undefined; 
    user.verificationTokenExpires = undefined;

    await user.save();
    
    // Check if cart already exists
    let cart = await Cart.findOne({ userId: user._id });
    // Create cart on account verification
    if (!cart) {
      cart = await Cart.create({
        userId: user._id,
        products: [],
        totalCartPrice: 0
      });
    }

    // Send success email
    await sendMail(successfulVerificationEmail(user.email, user.fullName));

    return res.status(200).json({ message: "Email verified successfully. You can now log in." });
  } catch (err) {
    console.error("Error verifying email", err);
    return res.status(500).json({ message: "Email verification failed", err: err.message });
  }
};

// Resend verification link 
export const resendVerificationLink = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "No account found with this email" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Account is already verified" });
    }

    // Prevent spam 
    if (user.lastVerificationSentAt && Date.now() < user.lastVerificationSentAt.getTime() + 30 * 60 * 1000) {
      return res.status(429).json({ 
        message: "Please wait for 30 minutes before requesting another verification email." 
      });
    }

    // Generate new token + expiry
    const newVerificationToken = crypto.randomBytes(32).toString("hex");

    user.verificationToken = newVerificationToken;
    user.verificationTokenExpires = Date.now() + 30 * 60 * 1000; // 30 min
    user.lastVerificationSentAt = new Date();

    await user.save();

    // Send email
    await sendMail(verifyAccountEmail(email, newVerificationToken));

    return res.status(200).json({ message: "Verification email resent successfully. Please check your inbox." });
  } catch (err) {
    console.error("Error resending verification email:", err);
    return res.status(500).json({ message: "Error resending verification email.", err: err.message });
  }
};

// Login user
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  // validate input
  if (!email || !password) {
    return res.status(400).json({ message: "Please provide all required fields." });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "No user found. Please register to continue." });
    }

    // Skip email verification for only superadmin
    if (user.role !== "superadmin" && !user.isVerified) {
      return res.status(403).json({ message: "Account is not verified." });
    }

    // Query database with incoming password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid login credentials!" });
    }

    // generate access token and refresh token
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Store refresh token to redis
    await storeRefreshToken(user._id, refreshToken);

    // Set cookies
    setCookies(res, accessToken, refreshToken);

    // save user
    await user.save();

    const fullName = user.fullName;

    // send successful login message to user
    await sendMail(successfulLoginEmail(email, fullName));

    return res.status(200).json({ message: "Successfully logged into your account." });
  } catch (err) {
    console.error("Login failed:", err)
    res.status(500).json({ message: "Failed to login:", err: err.message });
  }
};

//refresh accesstoken while still logged in
export const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token provided" });
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch {
      return res.status(403).json({ message: "Invalid or expired refresh token" });
    }

    // Check Redis
    const storedToken = await client.get(`refresh_token:${decoded.userId}`);
    if (!storedToken || storedToken !== refreshToken) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    // Generate new access token
    const newAccessToken = generateAccessToken(decoded.userId);

    // Set new access token in cookie
    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === "true",
      sameSite: process.env.COOKIE_SAMESITE === "none",
      maxAge:  30 * 60 * 1000  // 30 mins
    });

    // Set new access token in response body
    return res.status(200).json({
      message: "Access token refreshed successfully",
      accessToken: newAccessToken,
    });
  } catch (err) {
    console.error("Error refreshing access token:", err);
    return res.status(500).json({ message: "Error refreshing access token", err: err.message });
  }
};


// User logout
export const logoutUser = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(400).json({ message: "No refresh token found in cookies" });
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch (err) {
      console.warn("Invalid refresh token during logout:", err.message);
      return res.status(401).json({ message: "Invalid or expired refresh token" });
    }

    await client.del(`refresh_token:${decoded.userId}`);

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    return res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Error Logging Out", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Password reset request
export const passwordResetRequest = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found, please register first" });
    }

    // Generate secure token and expiry
    const passwordToken = crypto.randomBytes(32).toString("hex");
    const tokenExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes

    user.passwordResetToken = passwordToken;
    user.passwordResetExpires = tokenExpiry;

    // Save user
    await user.save();

    const fullName = user.fullName;

    // Send password reset link to user email
    await sendMail(passwordResetEmail(email, fullName, passwordToken));

    return res.status(200).json({ message: "Password reset request sent successfully" });
  } catch (error) {
    console.error("Password reset request error:", err);
    return res.status(500).json({ message: "Error sending password request", err: err.message });
  }
};

// Password reset
export const passwordReset = async (req, res) => {
  try {
    const { passwordToken, newPassword } = req.body;

    if (!passwordToken || !newPassword) {
      return res.status(400).json({ message: "Token and new password are required" });
    }

    const user = await User.findOne({
      passwordResetToken: passwordToken,
      passwordResetExpires: { $gt: Date.now() }, 
    });

    if (!user) {
      return res.status(400).json({ message: "Password reset token is invalid or expired" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.passwordChangedAt = Date.now();

    await user.save();

    // Send confirmation email
    await sendMail(successfulPasswordReset(user.email, user.fullName));

    return res.status(200).json({
      message: "Password reset successfully, proceed to login with your new password",
    });
  } catch (err) {
    console.error("Password reset error:", err);
    return res.status(500).json({ message: "Password reset failed", err: err.message });
  }
};




