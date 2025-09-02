import Order from "../../models/orderSchema.js";
import { sendMail, statusUpdateOnOrder } from "../../services/emailService.js";




// Admins only
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("userId", "fullName email").sort({ createdAt: -1 });

    return res.status(200).json(orders);
  } catch (err) {
    console.error("Error getting orders", err);
    res.status(500).json({ message: "Error getting orders", err: err.message });
  }
};

// Get orders of specific users
export const getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;

    const orders = await Order.find({ userId })
      .populate('userId', 'fullName email')
      .sort({ createdAt: -1 });

    if (orders.length === 0) {
      return res.status(404).json({ message: "No orders found for this user" });
    }

    res.status(200).json(orders);
  } catch (err) {
    console.error("Error getting users:", err)
    res.status(500).json({ message: "Error getting users", err: err.message });
  }
};


export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;

    // Find order and populate user
    const order = await Order.findById(id).populate("userId", "email fullName");
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Update status
    order.orderStatus = orderStatus;
    await order.save();

    const { email, fullName } = order.userId; 
    const orderId = order._id;

    // Notify customer if shipped/delivered
    if (["shipped", "delivered"].includes(orderStatus)) {
      await sendMail(statusUpdateOnOrder(email, orderStatus, fullName, orderId));
    }

    return res.json({ message: "Order status updated", order });
  } catch (err) {
    console.error("Error updating status:", err);
    res.status(500).json({ message: "Failed to update status", err: err.message });
  }
};
