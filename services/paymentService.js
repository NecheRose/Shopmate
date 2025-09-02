import Order from "../models/orderSchema.js";
import axios from "axios";
import { sendMail, successfulOrderPayment } from "./emailService.js";


export const initializePayment = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId).populate("userId");
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const reference = `ORDER_${order._id}_${Date.now()}`;

    const paystackResponse= await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email: order.userId.email,
        amount: order.totalOrderPrice * 100, // convert to kobo
        reference,
        callback_url:`http://localhost:5000/api/payments/verify/${reference}`,
        metadata: { orderId: order._id.toString() }
      },
      { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } }
    );

    return res.json({ 
      checkoutUrl: paystackResponse.data.data.authorization_url,
      reference: paystackResponse.data.data.reference
    });
  } catch (err) {
    console.error("Payment init failed:", err.message)
    res.status(500).json({ message: "Payment init failed", error: err.message });
  }
};


// Verify payment (manual check by reference)
export const verifyPayment = async (req, res) => {
  try {
    const { reference } = req.params;

    if (!reference) {
      return res.status(400).json({ message: "Payment reference is required" });
    }

    // Verify transaction with Paystack
    const paystackResponse = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
      }
    );

    const data = paystackResponse.data.data;

    if (paystackResponse.data.status && data.status === "success") {
      const orderId = data.metadata.orderId; // Passed metadata when initializing payment
      const order = await Order.findById(orderId).populate("userId", "fullName email");

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      if (order.paymentStatus === "paid") {
        return res.status(200).json({ message: "Payment already verified", order });
      }

      // Update order
      order.paymentStatus = "paid";
      order.orderStatus = "processing";
      order.paymentReference = reference;

      await order.save();

      // Send success email
      const { fullName, email } = order.userId;
      await sendMail(
        successfulOrderPayment(email, fullName, order.totalOrderPrice, order._id)
      );

      return res.status(200).json({ message: "Payment verified successfully", order });
    }

    return res.status(400).json({ message: "Payment not successful" });
  } catch (err) {
    console.error("Payment verification error:", err);
    res.status(500).json({ message: "Verification error", error: err.message });
  }
};
