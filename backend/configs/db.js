const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGODB_URI);

    console.log(
      `MongoDB Connected....................`
    );
  } catch (error) {
    console.error(
      `MongoDB Connection Failed: ${error.message}`
    );
  }
};

module.exports = connectDB;