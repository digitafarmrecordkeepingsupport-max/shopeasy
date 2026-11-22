const express = require('express');
const router = express.Router();
const Category = require('../models/Category');

// GET all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().sort({ displayOrder: 1, name: 1 });
    res.json({ success: true, count: categories.length, data: categories });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CREATE category
router.post('/', async (req, res) => {
  try {
    const slug =
      req.body.slug ||
      req.body.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') ||
      'category';
    const category = await Category.create({ ...req.body, slug });
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE category
router.put('/:id', async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!category) return res.status(404).json({ error: 'Category not found' });
    res.json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE category
router.delete('/:id', async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
