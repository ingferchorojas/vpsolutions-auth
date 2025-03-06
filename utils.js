const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const AWS = require("aws-sdk"); // Importar el SDK de AWS

// Configuración de AWS SES
AWS.config.update({ region: "us-east-1" }); // Asegúrate de que la región coincida con la tuya
const ses = new AWS.SES();

// Función para hashear la contraseña
async function hashPassword(password) {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
}

// Función para generar un JWT
function generateToken(userId, secret = process.env.JWT_SECRET, expiresIn = "2h") {
    if (!secret) {
        throw new Error("JWT_SECRET no está definido en las variables de entorno.");
    }

    return jwt.sign({ userId }, secret, { expiresIn });
}

// Función para enviar correos utilizando SES
async function sendEmail(from, to, subject, html) {
    const params = {
        Source: `VPSolutions <${from}>`, // Dirección "From" verificada en SES
        Destination: {
            ToAddresses: to, // Puede ser un array de correos
        },
        Message: {
            Subject: {
                Data: subject, // El asunto del correo
            },
            Body: {
                Html: {
                    Data: html, // El contenido en HTML del correo
                },
            },
        },
    };

    try {
        const result = await ses.sendEmail(params).promise(); // Enviar correo
        console.log("Correo enviado con éxito:", result.MessageId);
        return result;
    } catch (error) {
        console.error("Error al enviar el correo:", error);
        throw new Error("No se pudo enviar el correo.");
    }
}

module.exports = { hashPassword, generateToken, sendEmail };
