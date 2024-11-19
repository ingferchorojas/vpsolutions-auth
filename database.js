const mongoose = require("mongoose");

const connectToDatabase = async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.DB_NAME,
    });
    console.log("Conexión a MongoDB establecida con Mongoose");
  }
};

module.exports = { connectToDatabase };
