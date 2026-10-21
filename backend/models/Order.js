const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  sweetId: { type: String, required: true },
  name: { type: String, required: true },
  category: { type: String },
  weight: { type: String, required: true }, // e.g., '500g'
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true },
  itemTotal: { type: Number, required: true },
  image: { type: String },
  shopLocation: { type: String }
});

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  customer: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    pincode: { type: String, required: true },
    notes: { type: String }
  },
  items: [orderItemSchema],
  subtotal: { type: Number, required: true },
  deliveryFee: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['cod', 'upi', 'card'], default: 'cod' },
  paymentStatus: { type: String, default: 'Pending' },
  orderStatus: { type: String, default: 'Confirmed' },
  estimatedDeliveryTime: { type: String, default: '30-45 mins' },
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);
