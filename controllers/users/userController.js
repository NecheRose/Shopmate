import User from "../../models/userSchema.js";
import bcrypt from "bcryptjs";
import { sendMail, passwordChangeEmail, accountDeletionConfirm } from "../../services/emailService.js";


// Users getting their profile
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user._id; 

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user);
  } catch (err) {
    console.error("Error getting profile:", err);
    res.status(500).json({ message: "Error getting profile", err: err.message });
  }
};

// Update user profile
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fullName, email, phoneNumber, deliveryAddress } = req.body;

    const updateFields = {};

    if (fullName) updateFields.fullName = fullName;
    if (email) updateFields.email = email;
    if (phoneNumber) updateFields["profile.phoneNumber"] = phoneNumber;
    if (deliveryAddress) updateFields["profile.deliveryAddress"] = deliveryAddress;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.profile?.phoneNumber,
        deliveryAddress: user.profile?.deliveryAddress
      }
    });
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ message: "Error updating profile", err: err.message });
  }
};

// Change user password
export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Both current and new passwords are required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Validate current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Set new password
    user.password = hashedPassword;

    await user.save();

    // Send email
    await sendMail(passwordChangeEmail(user.email, user.fullName));

    return res.status(200).json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("Error changing password:", err);
    res.status(500).json({ message: "Error changing password", err: err.message });
  }
};

// Delete account
export const deleteUserAccount = async (req, res) => {
  try {
    const userId = req.user.id;   
    const { password } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Require password confirmation
    if (!password) {
      return res.status(400).json({ message: "Password is required to delete your account" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Password is incorrect" });
    }

    // Delete user
    await User.findByIdAndDelete(userId);

    // Send confirmation email
    await sendMail(accountDeletionConfirm(user.email, user.fullName));

    return res.status(200).json({ message: "Account deleted successfully" });
  } catch (err) {
    console.error("Error deleting account:", err);
    res.status(500).json({ message: "Error deleting account", err: err.message });
  }
};


