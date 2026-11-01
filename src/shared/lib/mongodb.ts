import mongoose from "mongoose";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const cache: MongooseCache = global.mongooseCache ?? {
  conn: null,
  promise: null,
};

global.mongooseCache = cache;

export async function connectMongo(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is not configured");
  }

  if (uri.includes("REPLACE_USER") || uri.includes("REPLACE_CLUSTER")) {
    throw new Error(
      "MONGODB_URI still has placeholders. Paste your Atlas connection string into .env.local",
    );
  }

  if (cache.conn) {
    return cache.conn;
  }

  if (!cache.promise) {
    const dbName = process.env.MONGODB_DB || undefined;

    cache.promise = mongoose.connect(uri, {
      bufferCommands: false,
      ...(dbName ? { dbName } : {}),
    });
  }

  try {
    cache.conn = await cache.promise;
  } catch (error) {
    cache.promise = null;
    throw error;
  }

  return cache.conn;
}
