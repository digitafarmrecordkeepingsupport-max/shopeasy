const express = require('express');
const router = express.Router();
const MarketingCampaign = require('../models/MarketingCampaign');

// GET all campaigns & stats
router.get('/', async (req, res) => {
  try {
    const campaigns = await MarketingCampaign.find().sort({ createdAt: -1 });
    res.json({ success: true, count: campaigns.length, data: campaigns });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CREATE campaign
router.post('/', async (req, res) => {
  try {
    const campaign = await MarketingCampaign.create(req.body);
    res.status(201).json({ success: true, data: campaign });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE campaign
router.delete('/:id', async (req, res) => {
  try {
    await MarketingCampaign.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Campaign deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
