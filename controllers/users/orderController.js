import Order from "../../models/orderSchema.js";
import Cart from "../../models/cartSchema.js";
import mongoose from "mongoose";
import { sendMail, orderConfirmationEmail } from "../../services/emailService.js";



export const createOrder = async (req, res) => {
  try {
    const { deliveryAddress } = req.body;
    const cart = await Cart.findOne({ userId: req.user._id }).populate("products.productId");
    if (!cart || cart.products.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Format products properly (avoid saving full product doc)
    const formattedProducts = cart.products.map(item => {
      let variant = null;

      // If the product has variants and user selected one
      if (item.variantId) {
        variant = item.productId.variants.find(
          v => v._id.toString() === item.variantId.toString()
        );
      }

      return {
        productId: item.productId._id,         
        productName: item.productId.productName, 
        variantId: item.variantId || null,
        attributes: item.attributes,
        quantity: item.quantity,
        price: item.price,
        totalItemPrice: item.totalItemPrice,
      };
    });

    // Calculate total price
    const totalOrderPrice = formattedProducts.reduce((sum, item) => sum + item.totalItemPrice, 0);

    // Create order with clean product data
    const order = await Order.create({
      userId: req.user._id,
      products: formattedProducts,
      totalOrderPrice,
      deliveryAddress,
      paymentMethod: "card",
      paymentStatus: "pending",
      orderStatus: "pending",
    });

    const orderId = order._id;
    const { email, fullName } = req.user; 

    // Send confirmation email
    await sendMail(orderConfirmationEmail(email, fullName, orderId, totalOrderPrice));

    // Clear cart
    cart.products = [];
    cart.totalCartPrice = 0;

    await cart.save();

    res.status(201).json({ message: "Order created successfully", order });
  } catch (error) {
    console.error("Failed to create order:", error.message);
    res.status(500).json({ message: "Error creating order" });
  }
};


// Get My Orders
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      userId: req.user._id,
      orderStatus: { $ne: "cancelled" }   // exclude cancelled orders
    }).sort({ createdAt: -1 }); // show the latest first

    if (orders.length === 0) {
      return res.status(404).json({ message: "No orders yet" });
    }

    res.status(200).json(orders);
  } catch (err) {
    console.error("Error getting orders:", err);
    res.status(500).json({ message: 'Error getting orders', err: err.message });
  }
};

// Cancel Order
export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findOne({ _id: id, userId: req.user._id });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.orderStatus === "cancelled") {
      return res.status(400).json({ message: "Order already cancelled" });
    }

    // Prevent cancelling if already shipped or delivered
    if (["shipped", "delivered"].includes(order.orderStatus)) {
      return res.status(400).json({ message: "Cannot cancel shipped or delivered orders" });
    }

    // Update order status
    order.orderStatus = "cancelled";

    await order.save();

    res.status(200).json({ message: "Order cancelled", order });
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).json({ message: "Invalid order ID" });
    }
    console.error("Error cancelling order:", error);
    res.status(500).json({ message: 'Error cancelling order', error: error.message });
  }
};


