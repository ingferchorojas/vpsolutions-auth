const { connectToDatabase } = require("./database");
const bcrypt = require("bcrypt");
const { generateToken } = require("./utils"); // Importar la función para generar el token

async function saveUser(userData) {
  const db = await connectToDatabase();
  const collection = db.collection("users");

  // Buscar si el email ya existe
  const existingUser = await collection.findOne({ email: userData.email });
  if (existingUser) {
    throw new Error("El email ya está registrado.");
  }

  // Insertar nuevo usuario
  const result = await collection.insertOne({
    ...userData,
    created_at: new Date(),
  });

  return result.insertedId;
}

async function loginUser(email, password) {
  const db = await connectToDatabase();
  const collection = db.collection("users");

  // Buscar si el usuario existe
  const user = await collection.findOne({ email });
  if (!user) {
    throw new Error("Correo electrónico o contraseña incorrectos.");
  }

  // Verificar si la contraseña es correcta
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error("Correo electrónico o contraseña incorrectos.");
  }

  // Generar un token JWT
  const token = generateToken(user._id); // Generar token con el userId

  return { token, userId: user._id }; // Retornar el token y el userId
}

module.exports = { saveUser, loginUser }; // Exportar ambas funciones
