const bcrypt = require("bcrypt");
const { generateToken, sendEmail } = require("./utils");
const { connectToDatabase, closeDatabaseConnection } = require("./database");
const User = require("./userModel");
const jwt = require("jsonwebtoken");

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

async function loginUser(event) {
    const { email, password } = event?.body ? JSON.parse(event.body) : {};
    if (!email) {
        return {
            statusCode: 400,
            error: true,
            message: "El email es requerido",
            data: {},
        };
    }
    if (!password) {
        return {
            statusCode: 400,
            error: true,
            message: "El password es requerido",
            data: {},
        };
    }
    await connectToDatabase(); // Ensure connection to MongoDB
    try {
        const user = await User.findOne({ email, enabled: true });
        if (!user) {
            return {
                statusCode: 400,
                error: true,
                message: "Incorrect email or password.",
                data: {},
            };
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return {
                statusCode: 400,
                error: true,
                message: "Incorrect email or password.",
                data: {},
            };
        }
        const token = generateToken(user._id);
        return {
            data: { token, userId: user._id, language: user.language },
            statusCode: 200,
            error: false,
            message: "Login correcto",
        };
    } catch (error) {
        console.error("❌ Error en login:", error);
        return {
            statusCode: 500,
            error: true,
            message: "Error interno del servidor",
            data: {},
        };
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

async function updatePasswordSendEmail(event) {
    const { email } = event?.body ? JSON.parse(event.body) : {};

    if (!email) {
        return {
            statusCode: 400,
            error: true,
            message: "El email es requerido",
            data: {},
        };
    }

    try {
        await connectToDatabase();

        // Verificar si el usuario existe
        const user = await User.findOne({ email, enabled: true });
        if (user) {
            // Si el usuario existe, enviar correo de recuperación de contraseña
            const from = "noreply@vpsolutions.cloud"; // Dirección verificada en SES
            const to = [email]; // Correo del usuario
            let subject = "Password Recovery";
            let button_text = "Reset Password";
            let hello = "Hello";
            let p1 = "We received a request to reset your password. If you did not request this, please ignore this email.";
            let p2 = "Click the button below to reset your password:";
            let rights = "All rights reserved.";
            let alternative = "If the button doesn't work, copy and paste this link into your browser:";
            let alert = "This link is valid for 30 minutes. If you did not request this change, please ignore this message."

            const Year = new Date().getFullYear();
            const token = generateToken(user._id, process.env.JWT_SECRET_CHANGE_PASSWORD, "30m");
            const link = `https://panel.vpsolutions.cloud/#/change_password?token=${token}`;

            if (user?.language && user?.language === "es") {
                subject = "Recuperación de Contraseña";
                button_text = "Restablecer Contraseña";
                hello = "Hola";
                p1 = "Recibimos una solicitud para restablecer tu contraseña. Si no realizaste esta solicitud, ignora este correo.";
                p2 = "Haz clic en el botón de abajo para restablecer tu contraseña:";
                rights = "Todos los derechos reservados.";
                alternative = "Si el botón no funciona, copia y pega este enlace en tu navegador:";
                alert = "Este enlace es válido por 30 minutos. Si no solicitaste este cambio, ignora este mensaje.";
            }

            if (user?.language && user?.language === "br") {
                subject = "Recuperação de Senha";
                button_text = "Redefinir Senha";
                hello = "Olá";
                p1 = "Recebemos uma solicitação para redefinir sua senha. Se você não solicitou isso, ignore este e-mail.";
                p2 = "Clique no botão abaixo para redefinir sua senha:";
                rights = "Todos os direitos reservados.";
                alternative = "Se o botão não funcionar, copie e cole este link no seu navegador:";
                alert = "Este link é válido por 30 minutos. Se você não solicitou esta alteração, ignore esta mensagem.";
            }

            const html = `<!DOCTYPE html>
                            <html lang="en">
                            <head>
                                <meta charset="UTF-8">
                                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                <title>${subject}</title>
                                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
                                <style>
                                    body {
                                        background-color: #f8f9fa;
                                        font-family: Arial, sans-serif;
                                    }
                                    .email-container {
                                        max-width: 600px;
                                        margin: 30px auto;
                                        background-color: #ffffff;
                                        border-radius: 10px;
                                        box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
                                        overflow: hidden;
                                    }
                                    .email-header {
                                        background-color: #3f51b5;
                                        color: white;
                                        padding: 20px;
                                        text-align: center;
                                        font-size: 24px;
                                        font-weight: bold;
                                    }
                                    .email-body {
                                        padding: 30px;
                                        text-align: center;
                                    }
                                    .email-body h1 {
                                        color: #333;
                                        font-size: 22px;
                                        font-weight: bold;
                                    }
                                    .email-body p {
                                        color: #555;
                                        font-size: 16px;
                                        line-height: 1.6;
                                    }
                                    .btn-custom {
                                        display: inline-block;
                                        padding: 12px 20px;
                                        font-size: 16px;
                                        font-weight: bold;
                                        color: #ffffff !important;
                                        background-color: #3f51b5;
                                        border-radius: 5px;
                                        text-decoration: none;
                                        text-align: center;
                                        border: none;
                                        cursor: pointer;
                                    }
                                    .email-footer {
                                        padding: 15px;
                                        background-color: #f1f1f1;
                                        text-align: center;
                                        font-size: 14px;
                                        color: #666;
                                    }
                                    .plain-link {
                                        margin-top: 15px;
                                        font-size: 14px;
                                        color: #3f51b5;
                                        word-break: break-all;
                                    }
                                </style>
                            </head>
                            <body>

                                <div class="email-container">
                                    <div class="email-header">
                                        VPSolutions - ${subject}
                                    </div>
                                    <div class="email-body">
                                        <h1>${hello}, ${user?.first_name ?? ''}</h1>
                                        <p>${p1}</p>
                                        <p>${p2}</p>
                                        <a href="${link}" class="btn-custom">
                                            ${button_text}
                                        </a>
                                        <p style="font-size: 14px; color: #6c757d;">
                                            ${alert}
                                        </p>
                                        <p class="plain-link">
                                            ${alternative} <br>
                                            <a href="${link}" style="color: #3f51b5; text-decoration: underline;">${link}</a>
                                        </p>
                                    </div>
                                    <div class="email-footer">
                                        &copy; ${Year} VPSolutions. ${rights}
                                    </div>
                                </div>
                            </body>
                            </html>`;
            // Enviar el correo
            await sendEmail(from, to, subject, html);
        }

        return {
            statusCode: 200,
            error: false,
            message:
                "If an account is associated with this email, a password recovery email has been sent.",
            data: {},
        };
    } catch (error) {
        console.error("❌ Error en updatePasswordSendEmail:", error);
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

async function updatePasswordWithToken(event) {
    const { password, token } = event?.body ? JSON.parse(event.body) : {};

    if (!password) {
        return {
            statusCode: 400,
            error: true,
            message: "Password is required",
            data: {},
        };
    }

    if (password.length < 6) {
        return {
            statusCode: 400,
            error: true,
            message: "Password must be at least 6 characters long",
            data: {},
        };
    }    

    if (!token) {
        return {
            statusCode: 400,
            error: true,
            message: "Token is required",
            data: {},
        };
    }

    try {
        await connectToDatabase();

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET_CHANGE_PASSWORD);
            console.log(decoded);

            // Verify if the user exists
            const user = await User.findOne({ _id: decoded.userId });

            if (!user) {
                return {
                    statusCode: 404,
                    error: true,
                    message: "User not found or token invalid",
                    data: {},
                };
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            await User.updateOne({ _id: user._id }, { password: hashedPassword });

        } catch (error) {
            console.error("❌ JWT Verification Error:", error);
            return {
                statusCode: 401,
                error: true,
                message: "Invalid or expired token",
                data: {},
            };
        }

        return {
            statusCode: 200,
            error: false,
            message: "Your password has been successfully changed.",
            data: {},
        };

    } catch (error) {
        console.error("❌ Internal Server Error:", error);
        return {
            statusCode: 500,
            error: true,
            message: "Internal server error",
            data: {},
        };
    } finally {
        await closeDatabaseConnection();
    }
}

module.exports = {
    saveUser,
    loginUser,
    updatePassword,
    updateLanguage,
    updatePasswordSendEmail,
    updatePasswordWithToken,
};
