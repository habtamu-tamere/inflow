const mongoose = require('mongoose');

const influencerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  niche: { type: String, required: true },
  followers: { type: Number, required: true },
  engagement: { type: Number, required: true },
  rate: { type: Number, required: true },
  nicheTags: [{ type: String }],
  avatar: { type: String, default: 'https://via.placeholder.com/200' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Influencer', influencerSchema);