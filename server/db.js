const mongoose = require('mongoose');
const path = require('path');
// Point directly to the .env file in the server directory
require('dotenv').config({ path: path.resolve(__dirname, './.env') });


const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;