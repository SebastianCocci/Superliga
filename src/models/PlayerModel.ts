import { Schema, model, models, Types } from "mongoose";

const playerSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true
    },

    categoria: {
      type: String,
      enum: ["Top ten", "A", "B", "C", "D"],
      required: true,
    },

    puntos: {
      type: Number,
      default: 0,
    },

    partidosJugados: {
      type: Number,
      default: 0,
    },

    partidosGanados: {
      type: Number,
      default: 0,
    },

    partidosPerdidos: {
      type: Number,
      default: 0,
    },
    activo: {
      type: Boolean,
      default: true,
    }
  },
  { timestamps: true }
);

export const Player = models.Player || model("Player", playerSchema);
