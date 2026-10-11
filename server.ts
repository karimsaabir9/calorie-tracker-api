import dotenv from "dotenv";
import express, { Request, Response, NextFunction} from "express";
import connectDB from "./config/db.js";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import foodRoutes from "./routes/food.js";
import reportsRoutes from "./routes/reports.js";

dotenv.config();

const app = express();
connectDB();

app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Api routes
app.use("/api/auth", authRoutes)
app.use("/api/food", foodRoutes)
app.use("/api/reports", reportsRoutes)

app.get("/", (req: Request, res: Response) => {
    res.json({
        message: "Welcome to colorie tracker API",
        version: "1.0.0",
        status: "success",
        timestamp: new Date().toISOString()
    });
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export default app;
