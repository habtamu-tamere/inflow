// const mongoose = require('mongoose');
// require('dotenv').config();

// const connectDB = async () => {
//   let retries = 5;
//   while (retries) {
//     try {
//       console.log('Attempting to connect to MongoDB with URI:', process.env.MONGO_URI);
//       await mongoose.connect(process.env.MONGO_URI);
//       console.log('MongoDB Connected...');
//       break;
//     } catch (err) {
//       console.error('Database connection error:', err.message);
//       retries -= 1;
//       console.log(`Retries left: ${retries}`);
//       if (retries === 0) {
//         process.exit(1);
//       }
//       await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds before retrying
//     }
//   }
// };

// module.exports = connectDB;


const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;