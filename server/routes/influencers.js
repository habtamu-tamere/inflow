const express = require('express');
const router = express.Router();
const Influencer = require('../models/Influencer');
const authMiddleware = require('../middleware/auth');

router.get('/', async (req, res) => {
  const { niche, followers, rate } = req.query;
  const filters = {};
  if (niche) filters.niche = niche;
  if (followers) filters.followers = { $gte: parseInt(followers.split('-')[0]), $lte: parseInt(followers.split('-')[1] || Infinity) };
  if (rate) filters.rate = { $gte: parseInt(rate.split('-')[0]), $lte: parseInt(rate.split('-')[1] || Infinity) };

  try {
    const influencers = await Influencer.find(filters).populate('user', 'name email');
    res.json(influencers);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  if (req.user.role !== 'influencer') {
    return res.status(403).json({ message: 'Only influencers can create profiles' });
  }

  const { name, niche, followers, engagement, rate, nicheTags, avatar } = req.body;

  try {
    const influencer = new Influencer({
      user: req.user.userId,
      name,
      niche,
      followers,
      engagement,
      rate,
      nicheTags,
      avatar,
    });
    await influencer.save();
    res.status(201).json(influencer);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;