const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET all customers
router.get('/', async (req, res) => {
  try {
    const customers = await User.find({ role: 'customer' }).sort({ createdAt: -1 });
    res.json({ success: true, count: customers.length, data: customers });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET customer by ID
router.get('/:id', async (req, res) => {
  try {
    const customer = await User.findById(req.params.id);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.json({ success: true, data: customer });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
