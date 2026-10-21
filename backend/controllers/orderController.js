const Order = require('../models/Order');
const { getDbStatus } = require('../config/db');

let memoryOrders = [];

// Create a new order
const createOrder = async (req, res) => {
  try {
    const { customer, items, subtotal, deliveryFee, discount, totalAmount, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart items cannot be empty' });
    }

    if (!customer || !customer.name || !customer.phone || !customer.email || !customer.address || !customer.city || !customer.pincode) {
      return res.status(400).json({ success: false, message: 'Please provide complete delivery details' });
    }

    const selectedPaymentMethod = paymentMethod || 'cod';
    const allowedPaymentMethods = ['cod', 'upi', 'card'];
    if (!allowedPaymentMethods.includes(selectedPaymentMethod)) {
      return res.status(400).json({ success: false, message: 'Please choose a supported payment method' });
    }

    const orderId = 'ROYAL-' + Math.floor(100000 + Math.random() * 900000);

    const orderData = {
      orderId,
      customer,
      items,
      subtotal: Number(subtotal) || 0,
      deliveryFee: Number(deliveryFee) || 0,
      discount: Number(discount) || 0,
      totalAmount: Number(totalAmount) || 0,
      paymentMethod: selectedPaymentMethod,
      // This project has no payment gateway integration, so online payments must
      // never be represented as completed or verified.
      paymentStatus: selectedPaymentMethod === 'cod'
        ? 'Pending (Cash On Delivery)'
        : 'Pending (Online Payment Verification Required)',
      orderStatus: 'Confirmed & Being Freshly Packed',
      estimatedDeliveryTime: '30 - 45 Minutes',
      createdAt: new Date()
    };

    if (getDbStatus()) {
      try {
        const newOrder = new Order(orderData);
        await newOrder.save();
      } catch (dbErr) {
        console.warn('[Order DB Error]', dbErr.message);
      }
    }

    memoryOrders.unshift(orderData);

    res.status(201).json({
      success: true,
      message: 'Order placed successfully! Sweets are being freshly packed with pure desi ghee.',
      data: orderData
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get order by Order ID
const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    let order = null;

    if (getDbStatus()) {
      order = await Order.findOne({ orderId }).lean();
    }
    if (!order) {
      order = memoryOrders.find(o => o.orderId === orderId);
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get orders by customer email or phone
const getCustomerOrders = async (req, res) => {
  try {
    const { phone, email } = req.query;
    let orders = [];

    if (getDbStatus()) {
      let filter = {};
      if (phone) filter['customer.phone'] = phone;
      if (email) filter['customer.email'] = email;
      orders = await Order.find(filter).sort({ createdAt: -1 }).lean();
    }
    if (orders.length === 0) {
      orders = memoryOrders.filter(o => 
        (phone && o.customer?.phone === phone) || 
        (email && o.customer?.email?.toLowerCase() === email.toLowerCase())
      );
    }

    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createOrder,
  getOrderById,
  getCustomerOrders
};
