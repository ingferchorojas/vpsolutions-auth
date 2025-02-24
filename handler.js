const { saveUser, loginUser, updatePassword, updateLanguage } = require("./userService");
const authMiddleware = require("./authMiddleware");

require("dotenv").config();

exports.register = async (event) => {
    try {
        const body = JSON.parse(event.body);

        // Validate required fields
        const { first_name, last_name, email, password } = body;
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
                enabled: true,
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

exports.login = async (event) => {
    try {
        const { email, password } = JSON.parse(event.body);

        // Validate fields
        if (!email || !password) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: "Email and password are required.",
                    error: true,
                }),
                headers: {
                    "Content-Type": "application/json", // Header for JSON
                },
            };
        }

        // Try to log in
        const response = await loginUser(email, password);

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Login successful.",
                data: response,
                error: false,
            }),
            headers: {
                "Content-Type": "application/json", // Header for JSON
            },
        };
    } catch (error) {
        console.error("Error logging in:", error);

        // If it's a validation error (incorrect email or password)
        if (error.message === "Incorrect email or password.") {
            return {
                statusCode: 401,
                body: JSON.stringify({
                    message: "Incorrect email or password.",
                    error: true,
                }),
                headers: {
                    "Content-Type": "application/json", // Header for JSON
                },
            };
        }

        // General error handling (500)
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
              message: error?.response?.data?.error ?? "500 Internal Server Error",
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
              message: error?.response?.data?.error ?? "500 Internal Server Error",
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
};
