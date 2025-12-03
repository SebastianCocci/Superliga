import { Schema, model, models, Types } from "mongoose";

/* ===========================================================
   TIPOS ÚTILES (solo backend)
=========================================================== */

export type EstadoResultado =
  | "sin_cargar"
  | "pendiente"
  | "aprobado"
  | "rechazado";

export type TipoResultado = "normal" | "wo" | "doble_wo";

/* ===========================================================
   SCHEMA DEL PARTIDO (DEFINITIVO)
=========================================================== */

const partidoSchema = new Schema(
  {
    /* =============================
       DATOS BÁSICOS DEL PARTIDO
    ==============================*/
    categoria: {
      type: String,
      enum: ["Top ten", "A", "B", "C", "D"],
      required: true,
    },

    fechaNumero: {
      type: Number,
      required: true, // ronda del fixture
      min: 1,
    },

    jugador1: {
      type: Types.ObjectId,
      ref: "Player",
      required: true,
    },

    jugador2: {
      type: Types.ObjectId,
      ref: "Player",
      required: true,
    },

    /* =============================
         ESTADO DE RESULTADO
    ==============================*/
    estado: {
      type: String,
      enum: ["sin_cargar", "pendiente", "aprobado", "rechazado"],
      default: "sin_cargar",
    },

    tipoResultado: {
      type: String,
      enum: ["normal", "wo", "doble_wo"],
      default: undefined,
    },

    /* =============================
       DETALLES DEL RESULTADO
    ==============================*/

    // Solo para tipoResultado = "normal".
    sets: {
      type: String, // Ej: "6/2 6/3"
      default: undefined,
    },

    // Debe existir si tipoResultado es normal o WO
    ganador: {
      type: Types.ObjectId,
      ref: "Player",
      default: undefined,
    },

    // Quién cargó el resultado
    cargadoPor: {
      type: Types.ObjectId,
      ref: "User",
      default: undefined,
    },

    fechaCarga: {
      type: Date,
      default: undefined,
    },

    fechaAprobacion: {
      type: Date,
      default: undefined,
    },

    /* =============================
       HISTORIAL (opcional pero útil)
       Permite auditar cambios.
    ==============================*/
    historial: [
      {
        fecha: { type: Date, default: Date.now },
        accion: String,
        usuario: { type: Types.ObjectId, ref: "User" },
      },
    ],
  },
  { timestamps: true }
);

/* ===========================================================
   EXPORT DEL MODELO
=========================================================== */
export const Partido =
  models.Partido || model("Partido", partidoSchema);
