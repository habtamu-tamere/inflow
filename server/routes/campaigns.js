const express = require('express');
const router = express.Router();
const Campaign = require('../models/Campaign');
const authMiddleware = require('../middleware/auth');

router.get('/', async (req, res) => {
  const { industry, budget, performance } = req.query;
  const filters = {};
  if (industry) filters.industry = industry;
  if (budget) filters.budget = budget;
  if (performance) filters.performanceModel = performance;

  try {
    const campaigns = await Campaign.find(filters).populate('createdBy', 'name');
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  const { title, description, industry, budget, performanceModel, nicheTags, deadline } = req.body;

  try {
    const campaign = new Campaign({
      title,
      description,
      industry,
      budget,
      performanceModel,
      nicheTags,
      deadline,
      createdBy: req.user.userId,
    });
    await campaign.save();
    res.status(201).json(campaign);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/:id/apply', authMiddleware, async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    if (campaign.applications.includes(req.user.userId)) {
      return res.status(400).json({ message: 'Already applied' });
    }
    campaign.applications.push(req.user.userId);
    await campaign.save();
    res.json({ message: 'Application submitted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;