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

async function updatePassword(event) {
    const user_id = event?.auth?.userId ?? "";
    if (!user_id) {
        return {
            statusCode: 400,
            error: true,
            message: "El user_id es requerido",
            data: {},
        };
    }

    const { password, new_password } = event?.body
        ? JSON.parse(event.body)
        : {};

    if (!password) {
        return {
            statusCode: 400,
            error: true,
            message: "El password es requerido",
            data: {},
        };
    }

    if (!new_password) {
        return {
            statusCode: 400,
            error: true,
            message: "El new_password es requerido",
            data: {},
        };
    }
    try {
        await connectToDatabase();
        dbConnected = true;

        // Verificar si el usuario existe
        const user = await User.findOne({ _id: user_id, enabled: true });
        if (!user) {
            return {
                statusCode: 400,
                error: true,
                message: "El usuario no existe",
                data: {},
            };
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return {
                statusCode: 400,
                error: true,
                message: "Incorrect password",
                data: {},
            };
        }

        const hashedPassword = await bcrypt.hash(new_password, 10);
        await User.updateOne(
            { _id: user_id, enabled: true },
            { password: hashedPassword }
        );

        return {
            statusCode: 200,
            error: false,
            message: "Password updated successfully",
            data: {},
        };
    } catch (error) {
        console.error("❌ Error en updatePassword:", error);
        return {
            statusCode: 500,
            error: true,
            message: "Error interno del servidor",
            data: {},
        };
    } finally {
        await closeDatabaseConnection();
    }
}

async function updateLanguage(event) {
    const user_id = event?.auth?.userId ?? "";
    if (!user_id) {
        return {
            statusCode: 400,
            error: true,
            message: "El user_id es requerido",
            data: {},
        };
    }

    const { language } = event?.body ? JSON.parse(event.body) : {};

    if (!language) {
        return {
            statusCode: 400,
            error: true,
            message: "El language es requerido",
            data: {},
        };
    }
    try {
        await connectToDatabase();

        // Verificar si el usuario existe
        const user = await User.findOne({ _id: user_id, enabled: true });
        if (!user) {
            return {
                statusCode: 400,
                error: true,
                message: "El usuario no existe",
                data: {},
            };
        }
        await User.updateOne({ _id: user_id }, { language });
        return {
            statusCode: 200,
            error: false,
            message: "Language updated successfully",
            data: {},
        };
    } catch (error) {
        console.error("❌ Error en updateLanguage:", error);
        return {
            statusCode: 500,
            error: true,
            message: "Error interno del servidor",
            data: {},
        };
    } finally {
        await closeDatabaseConnection();
    }
}

module.exports = { saveUser, loginUser, updatePassword, updateLanguage };
