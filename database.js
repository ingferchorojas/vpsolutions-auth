const mongoose = require("mongoose");

let isConnected = false; // Bandera para verificar si ya hay una conexión activa

const connectToDatabase = async () => {
  if (!isConnected) {
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        dbName: process.env.DB_NAME,
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10,
        minPoolSize: 5,
      });
      isConnected = true;
      console.log("✅ Conexión a MongoDB establecida");
    } catch (error) {
      console.error("❌ Error al conectar a MongoDB:", error);
      throw error;
    }
  } else {
    console.log("🔄 Conexión a MongoDB reutilizada");
  }
};

const closeDatabaseConnection = async () => {
  // NO cerramos la conexión si estamos reutilizando el contexto de Lambda
  if (mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2) {
    console.log("🔄 Conexión sigue abierta, no se cierra para Lambda");
  } else {
    try {
      await mongoose.connection.close();
      isConnected = false; // Resetear bandera
      console.log("✅ Conexión a MongoDB cerrada");
    } catch (error) {
      console.error("❌ Error al cerrar la conexión:", error);
    }
  }
};

module.exports = { connectToDatabase, closeDatabaseConnection };
