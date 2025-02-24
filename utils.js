const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken"); // Importar la librería jwt

// Función para hashear la contraseña
async function hashPassword(password) {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
}

// Función para generar un JWT
function generateToken(userId) {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error(
            "JWT_SECRET no está definido en las variables de entorno."
        );
    }

    return jwt.sign({ userId }, secret, { expiresIn: "2h" });
}

module.exports = { hashPassword, generateToken };
