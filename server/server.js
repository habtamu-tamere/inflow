const express = require('express');
// const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const campaignRoutes = require('./routes/campaigns');
const influencerRoutes = require('./routes/influencers');

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, '../client')));
app.use('/api/auth', authRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/influencers', influencerRoutes);

app.use(express.static('../client')); // Serve frontend

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
