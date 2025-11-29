import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error("❌ MONGODB_URI no está definida en .env.local");
}

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) {
    console.log("⚡ Ya conectado a MongoDB");
    return;
  }

  try {
    const db = await mongoose.connect(MONGODB_URI);
    isConnected = true;
    console.log("✅ Conectado a MongoDB:", db.connection.host);
  } catch (error) {
    console.error("❌ Error conectando a MongoDB:", error);
    throw error;
  }
};
