import mongoose from "mongoose";

let databaseConnected = false;
let lastConnectionError = null;

export async function connectDatabase() {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    databaseConnected = false;
    lastConnectionError = "MONGO_URI is not configured.";
    console.warn("MONGO_URI is not configured. Starting backend without database connection.");
    return null;
  }

  try {
    const connection = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
    });
    databaseConnected = true;
    lastConnectionError = null;
    console.log(`MongoDB connected to database "${connection.connection.name}".`);
    return connection;
  } catch (error) {
    databaseConnected = false;
    lastConnectionError = error.message;
    console.error("MongoDB connection failed:", error.message);
    throw error;
  }
}

export function isDatabaseConnected() {
  return databaseConnected;
}

export function getDatabaseStatus() {
  return {
    connected: databaseConnected,
    databaseName: mongoose.connection?.name || null,
    host: mongoose.connection?.host || null,
    readyState: mongoose.connection?.readyState ?? 0,
    lastConnectionError,
  };
}
