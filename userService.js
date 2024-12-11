const bcrypt = require("bcrypt");
const { generateToken } = require("./utils");
const { connectToDatabase, closeDatabaseConnection } = require("./database");
const User = require("./userModel");

async function saveUser(userData) {
  await connectToDatabase(); // Ensure connection to MongoDB
  try {
    // Check if the email already exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new Error("The email is already registered.");
    }

    // Create and save the user
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const newUser = new User({
      ...userData,
      password: hashedPassword,
    });
    await newUser.save();

    return newUser._id;
  } catch (error) {
    console.error("❌ Error in saveUser:", error);
    throw error;
  } finally {
    await closeDatabaseConnection(); // Close the connection after completing the operation
  }
}

async function loginUser(email, password) {
  await connectToDatabase(); // Ensure connection to MongoDB
  try {
    const user = await User.findOne({ email, enabled: true });
    if (!user) {
      throw new Error("Incorrect email or password.");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Incorrect email or password.");
    }

    const token = generateToken(user._id);
    return { token, userId: user._id, language: user.language };
  } catch (error) {
    console.error("❌ Error in loginUser:", error);
    throw error;
  } finally {
    await closeDatabaseConnection(); // Close the connection after completing the operation
  }
}

module.exports = { saveUser, loginUser };
