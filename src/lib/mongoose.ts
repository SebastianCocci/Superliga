import mongoose, { type Mongoose } from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("❌ MONGODB_URI no está definida en .env.local");
}

type MongooseCache = {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
};

const globalWithMongoose = globalThis as unknown as { __mongooseCache?: MongooseCache };

if (!globalWithMongoose.__mongooseCache) {
  globalWithMongoose.__mongooseCache = { conn: null, promise: null };
}

export const connectDB = async (): Promise<void> => {
  const cache = globalWithMongoose.__mongooseCache!;

  if (cache.conn) {
    return;
  }

  if (!cache.promise) {
    cache.promise = mongoose.connect(MONGODB_URI);
  }

  try {
    cache.conn = await cache.promise;
    console.log("✅ Conectado a MongoDB:", cache.conn.connection.host);
  } catch (error) {
    cache.promise = null;
    console.error("❌ Error conectando a MongoDB:", error);
    throw error;
  }
};
