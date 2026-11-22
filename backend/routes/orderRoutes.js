const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

// GET all orders (with customer or status filter)
router.get('/', async (req, res) => {
  try {
    const { customerId, status } = req.query;
    const query = {};
    if (customerId) query.customerId = customerId;
    if (status && status !== 'all') query.orderStatus = status;

    const orders = await Order.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single order
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findOne({
      $or: [{ _id: req.params.id }, { orderNumber: req.params.id }],
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CREATE order (with atomic inventory reduction)
router.post('/', async (req, res) => {
  try {
    const randomDigits = Math.floor(10000 + Math.random() * 90000);
    const orderNumber = `SE-${randomDigits}`;

    // Atomically decrement stock
    if (req.body.items && Array.isArray(req.body.items)) {
      for (const item of req.body.items) {
        if (item.productId) {
          await Product.findOneAndUpdate(
            { _id: item.productId, stockQuantity: { $gte: item.quantity } },
            { $inc: { stockQuantity: -item.quantity } }
          );
        }
      }
    }

    const order = await Order.create({
      ...req.body,
      orderNumber,
      currency: 'NGN',
    });

    // Update customer stats
    if (req.body.customerEmail) {
      await User.findOneAndUpdate(
        { email: req.body.customerEmail.toLowerCase() },
        {
          $inc: {
            totalOrders: 1,
            totalSpent: req.body.totalAmount || req.body.total || 0,
          },
        }
      );
    }

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE order status (with auto stock restoration if cancelled)
router.patch('/:id', async (req, res) => {
  try {
    const { orderStatus, paymentStatus } = req.body;
    const existing = await Order.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Order not found' });

    // If cancelled, restore stock
    if (orderStatus === 'cancelled' && existing.orderStatus !== 'cancelled') {
      for (const item of existing.items) {
        if (item.productId) {
          await Product.findByIdAndUpdate(item.productId, {
            $inc: { stockQuantity: item.quantity },
          });
        }
      }
    }

    if (orderStatus) existing.orderStatus = orderStatus;
    if (paymentStatus) existing.paymentStatus = paymentStatus;

    await existing.save();
    res.json({ success: true, data: existing });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
