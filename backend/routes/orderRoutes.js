const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrderById,
  getCustomerOrders
} = require('../controllers/orderController');

router.post('/orders', createOrder);
router.get('/orders/:orderId', getOrderById);
router.get('/orders', getCustomerOrders);

module.exports = router;
