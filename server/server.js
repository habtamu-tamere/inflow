const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const campaignRoutes = require('./routes/campaigns');
const influencerRoutes = require('./routes/influencers');

// Load environment variables with debug
dotenv.config({ debug: true });

// Log environment variables for debugging (remove in production)
console.log('MONGO_URI:', process.env.MONGO_URI);
console.log('JWT_SECRET:', process.env.JWT_SECRET);
console.log('PORT:', process.env.PORT);

// Connect to MongoDB
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Serve frontend
app.use(express.static(path.join(__dirname, '../client')));
// app.use(express.static('../client'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/influencers', influencerRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server error', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


// const express = require('express');
// const cors = require('cors');
// const dotenv = require('dotenv');
// const connectDB = require('./config/db');
// const authRoutes = require('./routes/auth');
// const campaignRoutes = require('./routes/campaigns');
// const influencerRoutes = require('./routes/influencers');

// // Load environment variables with debug
// dotenv.config({ debug: true });

// // Log environment variables for debugging (remove in production)
// console.log('MONGO_URI:', process.env.MONGO_URI);
// console.log('JWT_SECRET:', process.env.JWT_SECRET);
// console.log('PORT:', process.env.PORT);

// // Connect to MongoDB
// connectDB();

// const app = express();
// app.use(cors());
// app.use(express.json());

// // Serve frontend
// app.use(express.static('../client'));

// // Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/campaigns', campaignRoutes);
// app.use('/api/influencers', influencerRoutes);

// // Error handling middleware
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({ message: 'Server error', error: err.message });
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
