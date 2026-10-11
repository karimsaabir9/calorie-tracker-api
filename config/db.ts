import mongoose from "mongoose";
import { config } from "./config.js";

let connectionPromise: Promise<typeof mongoose> | null = null;

const connectDB = (): Promise<typeof mongoose> => {
  if (mongoose.connection.readyState === 1) {
    return Promise.resolve(mongoose);
  }

  if (!connectionPromise) {
    const mongoURI = config.mongodbUri;

    if (!mongoURI) {
      return Promise.reject(
        new Error("MongoDB URI is not defined in the environment variables")
      );
    }

    connectionPromise = mongoose
      .connect(mongoURI)
      .then((conn) => {
        console.log(`Connected to MongoDB: ${conn.connection.host}`);
        return conn;
      })
      .catch((error) => {
        // allow the next request to retry instead of staying stuck on a failed connection
        connectionPromise = null;
        throw error;
      });
  }

  return connectionPromise;
};

export default connectDB;