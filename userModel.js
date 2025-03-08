const mongoose = require("mongoose");

// Definir el esquema de usuario
const userSchema = new mongoose.Schema(
    {
        first_name: { type: String, required: true },
        last_name: { type: String, required: true },
        email: { type: String, required: true, unique: true, index: true },
        password: { type: String, required: true },
        enabled: { type: Boolean, required: true },
        email_verified: { type: Boolean, required: true, default: false },
        language: {
            type: String,
            enum: ["en", "es", "br"],
            default: "es",
        },
    },
    {
        timestamps: true,
    }
);

// Crear el modelo de usuario
const User = mongoose.model("User", userSchema);

module.exports = User;
