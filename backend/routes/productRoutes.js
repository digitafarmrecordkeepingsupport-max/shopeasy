const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Category = require('../models/Category');

// GET all products (with optional filtering)
router.get('/', async (req, res) => {
  try {
    const { category, search, featured } = req.query;
    const query = { isActive: true };

    if (category && category !== 'all') {
      query.categoryId = category;
    }
    if (featured === 'true') {
      query.isFeatured = true;
    }
    if (search && search.trim()) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { categoryName: { $regex: search, $options: 'i' } },
      ];
    }

    const products = await Product.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: products.length, data: products });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET product by ID or slug
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findOne({ $or: [{ _id: id }, { slug: id }] });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CREATE product
router.post('/', async (req, res) => {
  try {
    const slug =
      req.body.slug ||
      req.body.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') ||
      'product';
    const sku = req.body.sku || `SE-${Math.floor(1000 + Math.random() * 9000)}`;

    const product = await Product.create({ ...req.body, slug, sku });

    // Increment category itemCount
    if (req.body.categoryId) {
      await Category.findOneAndUpdate(
        { $or: [{ _id: req.body.categoryId }, { slug: req.body.categoryId }] },
        { $inc: { itemCount: 1 } }
      );
    }

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE product
router.put('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE (soft archive) product
router.delete('/:id', async (req, res) => {
  try {
    await Product.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Product archived' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
