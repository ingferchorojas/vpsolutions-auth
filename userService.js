const bcrypt = require("bcrypt");
const { generateToken } = require("./utils");
const { connectToDatabase } = require("./database");
const User = require("./userModel");

async function saveUser(userData) {
  await connectToDatabase(); // Asegurar conexión con MongoDB

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
}

async function loginUser(email, password) {
  await connectToDatabase(); // Asegurar conexión con MongoDB

  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Correo electrónico o contraseña incorrectos.");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error("Correo electrónico o contraseña incorrectos.");
  }

  const token = generateToken(user._id);
  return { token, userId: user._id };
}

module.exports = { saveUser, loginUser };
