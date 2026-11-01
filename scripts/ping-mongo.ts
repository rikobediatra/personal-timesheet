import mongoose from "mongoose";
import { connectMongo } from "../src/shared/lib/mongodb";

async function main() {
  console.log("Connecting to MongoDB Atlas...");

  const connection = await connectMongo();
  const db = connection.connection.db;

  if (!db) {
    throw new Error("MongoDB connection established but database handle is missing");
  }

  const ping = await db.admin().ping();
  const dbName = db.databaseName;
  const readyState = connection.connection.readyState;

  console.log(
    JSON.stringify(
      {
        ok: ping?.ok === 1,
        dbName,
        readyState,
        readyStateLabel: readyState === 1 ? "connected" : String(readyState),
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error("MongoDB ping failed:", message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect().catch(() => undefined);
  });
