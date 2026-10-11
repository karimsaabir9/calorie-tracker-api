import dotenv from "dotenv";
import connectDB from "./config/db.js";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import foodRoutes from "./routes/food.js";
import reportsRoutes from "./routes/reports.js";

dotenv.config();

import { config } from "./config/config.js";
const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// make sure MongoDB is connected before any request is handled, instead of
// racing a cold-start connection against mongoose's query buffering timeout
app.use(async (req: Request, res: Response, next: NextFunction) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("Database connection failed:", error);
    res.status(503).json({ message: "Database unavailable" });
  }
});

// API routes

app.use("/api/auth", authRoutes);
app.use("/api/food", foodRoutes);
app.use("/api/reports", reportsRoutes);

app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Welcome to colorie trucker API",
    version: "1.0.0",
    status: "success",
    timestamp: new Date().toISOString(),
  });
});

// error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal server error" });
});

// 404 middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({ message: "Route not found" });
});

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});