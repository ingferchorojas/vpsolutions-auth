const jwt = require("jsonwebtoken");
require("dotenv").config();

// Middleware para verificar el token JWT
const authMiddleware = (handler) => {
    return async (event) => {
        try {
            // Obtener el token del encabezado Authorization
            const tokenHeader =
                event.headers.Authorization || event.headers.authorization;

            if (!tokenHeader) {
                return {
                    statusCode: 401,
                    body: JSON.stringify({
                        message: "No se proporcionó token de autenticación.",
                        error: true,
                    }),
                    headers: {
                        "Content-Type": "application/json",
                    },
                };
            }

            // Verificar si el token tiene el prefijo "Bearer " y extraer el token
            const token = tokenHeader.startsWith("Bearer ")
                ? tokenHeader.slice(7)  // Elimina "Bearer " (7 caracteres)
                : tokenHeader; // Si no tiene el prefijo, usar el valor completo

            // Verificar y decodificar el token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Agregar el payload decodificado al objeto event
            event.auth = decoded;

            // Si el token es válido, llamar al handler original
            return await handler(event);
        } catch (error) {
            console.error("❌ Error de autenticación:", error);
            return {
                statusCode: 401,
                body: JSON.stringify({
                    message: "Token inválido o expirado.",
                    error: true,
                }),
                headers: {
                    "Content-Type": "application/json",
                },
            };
        }
    };
};

module.exports = authMiddleware;
