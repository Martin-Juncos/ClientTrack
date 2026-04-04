import mongoose from "mongoose";
import { env } from "../config/env.js";

mongoose.set("strictQuery", true);

const globalCache = globalThis.__clientTrackMongoose ?? {
  conn: null,
  promise: null
};

globalThis.__clientTrackMongoose = globalCache;

export async function connectDb() {
  if (globalCache.conn) {
    return globalCache.conn;
  }

  if (!globalCache.promise) {
    globalCache.promise = mongoose
      .connect(env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000
      })
      .then((instance) => {
        globalCache.conn = instance;
        return instance;
      })
      .catch((error) => {
        globalCache.promise = null;
        throw error;
      });
  }

  return globalCache.promise;
}

export async function ensureDbReady() {
  await connectDb();

  if (!mongoose.connection?.db) {
    throw new Error("La conexion a MongoDB no esta disponible.");
  }

  await mongoose.connection.db.admin().ping();
  return true;
}
