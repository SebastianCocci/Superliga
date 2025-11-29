import { Schema, model, models } from "mongoose";

const UserSchema = new Schema(
  {
    name: String,
    email: { type: String, unique: true },
    role: { type: String, enum: ["admin", "jugador"], default: "jugador" },
  },
  { timestamps: true }
);

export default models.User || model("User", UserSchema);
