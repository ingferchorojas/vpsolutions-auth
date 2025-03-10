const {
    saveUser,
    loginUser,
    updatePassword,
    updateLanguage,
    updatePasswordSendEmail,
    updatePasswordWithToken,
    activateAccount
} = require("./userService");
const authMiddleware = require("./authMiddleware");

require("dotenv").config();

const register = async (event) => {
    try {
        const body = JSON.parse(event.body);

        // Validate required fields
        const { first_name, last_name, email, password, language } = body;
        if (!first_name || !last_name || !email || !password) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: "All fields are required.",
                    error: true,
                }),
                headers: {
                    "Content-Type": "application/json", // Header for JSON
                },
            };
        }

        // Try to save the user
        try {
            const userId = await saveUser({
                first_name,
                last_name,
                email,
                password,
                enabled: false,
                language
            });

            return {
                statusCode: 201,
                body: JSON.stringify({
                    message: "User registered successfully.",
                    data: {
                        userId,
                    },
                    error: false,
                }),
                headers: {
                    "Content-Type": "application/json", // Header for JSON
                },
            };
        } catch (err) {
            // Check if the error is due to duplicate email
            if (err.message === "The email is already registered.") {
                return {
                    statusCode: 409, // Conflict status code
                    body: JSON.stringify({
                        message: "The email is already registered.",
                        error: true,
                    }),
                    headers: {
                        "Content-Type": "application/json", // Header for JSON
                    },
                };
            }

            throw err; // Throw any other error
        }
    } catch (error) {
        console.error("Error registering user:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Internal server error.",
                error: true,
            }),
            headers: {
                "Content-Type": "application/json", // Header for JSON
            },
        };
    }
};

const login = async (event) => {
    try {
        const result = await loginUser(event);
        return {
            statusCode: result?.statusCode ?? 200,
            body: JSON.stringify({
                message: result?.message ?? "Login",
                data: result?.data ?? {},
                error: result.error ?? false,
            }),
            headers: {
                "Content-Type": "application/json",
            },
        };
    } catch (error) {
        console.error("❌ Error en el login:", error);
        return {
            statusCode: error?.response?.data?.status ?? 500,
            body: JSON.stringify({
                message:
                    error?.response?.data?.error ?? "500 Internal Server Error",
                error: true,
            }),
            headers: {
                "Content-Type": "application/json",
            },
        };
    }
};

const updateOldPassword = async (event) => {
    try {
        const result = await updatePassword(event);
        return {
            statusCode: result?.statusCode ?? 200,
            body: JSON.stringify({
                message: result?.message ?? "Contraseña actualizada",
                data: result?.data ?? [],
                error: result.error ?? false,
            }),
            headers: {
                "Content-Type": "application/json",
            },
        };
    } catch (error) {
        console.error("❌ Error al actualizar contraseña:", error);
        return {
            statusCode: error?.response?.data?.status ?? 500,
            body: JSON.stringify({
                message:
                    error?.response?.data?.error ?? "500 Internal Server Error",
                error: true,
            }),
            headers: {
                "Content-Type": "application/json",
            },
        };
    }
};

const updateOldLanguage = async (event) => {
    try {
        const result = await updateLanguage(event);
        return {
            statusCode: result?.statusCode ?? 200,
            body: JSON.stringify({
                message: result?.message ?? "Lenguage actualizada",
                data: result?.data ?? [],
                error: result.error ?? false,
            }),
            headers: {
                "Content-Type": "application/json",
            },
        };
    } catch (error) {
        console.error("❌ Error al actualizar lenguage:", error);
        return {
            statusCode: error?.response?.data?.status ?? 500,
            body: JSON.stringify({
                message:
                    error?.response?.data?.error ?? "500 Internal Server Error",
                error: true,
            }),
            headers: {
                "Content-Type": "application/json",
            },
        };
    }
};

const passwordSendEmail = async (event) => {
    try {
        const result = await updatePasswordSendEmail(event);
        return {
            statusCode: result?.statusCode ?? 200,
            body: JSON.stringify({
                message: result?.message ?? "Correo de recuperación de contraseña",
                data: result?.data ?? [],
                error: result.error ?? false,
            }),
            headers: {
                "Content-Type": "application/json",
            },
        };
    } catch (error) {
        console.error("❌ Error al enviar correo de recuperación de contraseña:", error);
        return {
            statusCode: error?.response?.data?.status ?? 500,
            body: JSON.stringify({
                message:
                    error?.response?.data?.error ?? "500 Internal Server Error",
                error: true,
            }),
            headers: {
                "Content-Type": "application/json",
            },
        };
    }
};

const updatePasswordToken = async (event) => {
    try {
        const result = await updatePasswordWithToken(event);
        return {
            statusCode: result?.statusCode ?? 200,
            body: JSON.stringify({
                message: result?.message ?? "Actualización de contraseña por token",
                data: result?.data ?? [],
                error: result.error ?? false,
            }),
            headers: {
                "Content-Type": "application/json",
            },
        };
    } catch (error) {
        console.error("❌ Error al actualizar contraseña:", error);
        return {
            statusCode: error?.response?.data?.status ?? 500,
            body: JSON.stringify({
                message:
                    error?.response?.data?.error ?? "500 Internal Server Error",
                error: true,
            }),
            headers: {
                "Content-Type": "application/json",
            },
        };
    }
};

const activateAccountToken = async (event) => {
    try {
        const result = await activateAccount(event);
        return {
            statusCode: result?.statusCode ?? 200,
            body: JSON.stringify({
                message: result?.message ?? "Cuenta activada por token",
                data: result?.data ?? [],
                error: result.error ?? false,
            }),
            headers: {
                "Content-Type": "application/json",
            },
        };
    } catch (error) {
        console.error("❌ Error al activar cuenta:", error);
        return {
            statusCode: error?.response?.data?.status ?? 500,
            body: JSON.stringify({
                message:
                    error?.response?.data?.error ?? "500 Internal Server Error",
                error: true,
            }),
            headers: {
                "Content-Type": "application/json",
            },
        };
    }
};

module.exports = {
    updateOldPassword: authMiddleware(updateOldPassword),
    updateOldLanguage: authMiddleware(updateOldLanguage),
    login,
    register,
    passwordSendEmail,
    updatePasswordToken,
    activateAccountToken,
};
