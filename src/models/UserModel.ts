import { Schema, model, models } from "mongoose";

const userSchema = new Schema(
  {
    email: { 
      type: String, 
      required: true, 
      unique: true, 
      lowercase: true, 
      trim: true 
    },

    password: { 
      type: String, 
      required: true, 
      select: false // evita enviarlo en queries por defecto
    },

    role: {
      type: String,
      enum: ["admin", "jugador"], // perfecto
      required: true,
    },

    nombre: { type: String, required: true, trim: true },

    apellido: { type: String, required: true, trim: true },

    dni: { type: String, required: true, trim: true },

    telefono: { type: String, trim: true }
  },
  { timestamps: true }
);

export const User = models.User || model("User", userSchema);
