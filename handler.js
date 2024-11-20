const { saveUser, loginUser } = require("./userService");
const { hashPassword } = require("./utils");

require("dotenv").config();

exports.register = async (event) => {
  try {
    const body = JSON.parse(event.body);

    // Validar campos requeridos
    const { first_name, last_name, email, password } = body;
    if (!first_name || !last_name || !email || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Todos los campos son obligatorios.",
          error: true,
        }),
        headers: {
          "Content-Type": "application/json", // Header para JSON
        },
      };
    }

    // Intentar guardar el usuario
    try {
      const userId = await saveUser({
        first_name,
        last_name,
        email,
        password,
        enabled: true
      });

      return {
        statusCode: 201,
        body: JSON.stringify({
          message: "Usuario registrado correctamente.",
          data: {
            userId
          },
          error: false,
        }),
        headers: {
          "Content-Type": "application/json", // Header para JSON
        },
      };
    } catch (err) {
      // Verificar si el error es por duplicado de email
      if (err.message === "El email ya está registrado.") {
        return {
          statusCode: 409, // Código de conflicto
          body: JSON.stringify({
            message: "El email ya está registrado.",
            error: true,
          }),
          headers: {
            "Content-Type": "application/json", // Header para JSON
          },
        };
      }

      throw err; // Lanzar cualquier otro error
    }
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error interno del servidor.",
        error: true,
      }),
      headers: {
        "Content-Type": "application/json", // Header para JSON
      },
    };
  }
};

exports.login = async (event) => {
  try {
    const { email, password } = JSON.parse(event.body);

    // Validar los campos
    if (!email || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "El email y la contraseña son obligatorios.",
          error: true,
        }),
        headers: {
          "Content-Type": "application/json", // Header para JSON
        },
      };
    }

    // Intentar hacer login
    const { token, userId } = await loginUser(email, password);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Login exitoso.",
        data: { token, userId },
        error: false,
      }),
      headers: {
        "Content-Type": "application/json", // Header para JSON
      },
    };
  } catch (error) {
    console.error("Error al hacer login:", error);
    
    // Si es un error de validación (incorrecto email o password)
    if (error.message === "Correo electrónico o contraseña incorrectos.") {
      return {
        statusCode: 401,
        body: JSON.stringify({
          message: "Correo electrónico o contraseña incorrectos.",
          error: true,
        }),
        headers: {
          "Content-Type": "application/json", // Header para JSON
        },
      };
    }

    // Manejo de error general (500)
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error interno del servidor.",
        error: true,
      }),
      headers: {
        "Content-Type": "application/json", // Header para JSON
      },
    };
  }
};
