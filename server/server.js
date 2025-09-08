const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const campaignRoutes = require('./routes/campaigns');
const influencerRoutes = require('./routes/influencers');

const app = express();

// Log environment variables (without exposing sensitive values)
console.log('Environment Variables:', {
  MONGO_URI: process.env.MONGO_URI ? 'Set' : 'Not set',
  JWT_SECRET: process.env.JWT_SECRET ? 'Set' : 'Not set',
  PORT: process.env.PORT || 5000,
});

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: ['https://inflow-tiy3.onrender.com', 'http://localhost:5000'],
  credentials: true,
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/influencers', influencerRoutes);

// Fallback for SPA
app.get('*', (req, res) => {
  console.log(`Serving fallback route: ${req.url}`);
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));