import { Schema, models, model } from "mongoose";
import type { InferSchemaType, Model } from "mongoose";

export const CATEGORIAS = ["Top ten", "A", "B", "C", "D"] as const;
export type Categoria = (typeof CATEGORIAS)[number];

const CategoryConfigSchema = new Schema(
  {
    categoria: {
      type: String,
      enum: CATEGORIAS,
      required: true,
      unique: true,
      index: true,
    },
    ascensos: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    descensos: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
  },
  { timestamps: true }
);

export type CategoryConfig = InferSchemaType<typeof CategoryConfigSchema>;

export const CategoryConfigModel: Model<CategoryConfig> =
  (models.CategoryConfig as Model<CategoryConfig>) ||
  model<CategoryConfig>("CategoryConfig", CategoryConfigSchema);
