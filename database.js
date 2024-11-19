const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI; // URI desde las variables de entorno
const dbName = process.env.DB_NAME; // Nombre de la base de datos

let client;

async function connectToDatabase() {
  if (!client) {
    console.log("Conectando a MongoDB...");
    client = new MongoClient(uri);
    await client.connect();
  }
  return client.db(dbName);
}

module.exports = { connectToDatabase };
