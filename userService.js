const bcrypt = require("bcrypt");
const { generateToken } = require("./utils");
const { connectToDatabase, closeDatabaseConnection } = require("./database");
const User = require("./userModel");

async function saveUser(userData) {
  await connectToDatabase(); // Asegurar conexión con MongoDB
  try {
    // Verificar si el email ya existe
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new Error("El email ya está registrado.");
    }

    // Crear y guardar el usuario
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const newUser = new User({
      ...userData,
      password: hashedPassword,
    });
    await newUser.save();

    return newUser._id;
  } catch (error) {
    console.error("❌ Error en saveUser:", error);
    throw error;
  } finally {
    await closeDatabaseConnection(); // Cerrar la conexión después de completar la operación
  }
}

async function loginUser(email, password) {
  await connectToDatabase(); // Asegurar conexión con MongoDB
  try {
    const user = await User.findOne({ email, enabled: true });
    if (!user) {
      throw new Error("Correo electrónico o contraseña incorrectos.");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Correo electrónico o contraseña incorrectos.");
    }

    const token = generateToken(user._id);
    return { token, userId: user._id };
  } catch (error) {
    console.error("❌ Error en loginUser:", error);
    throw error;
  } finally {
    await closeDatabaseConnection(); // Cerrar la conexión después de completar la operación
  }
}

module.exports = { saveUser, loginUser };
