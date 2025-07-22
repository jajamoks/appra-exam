/* eslint-disable no-console */
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { initializeDatabase } from "./database/database";
import userRoutes from "./routes/users";
import authRoutes from "./routes/auth";
import verificationRoutes from "./routes/verification";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:3002"
}));
app.use(express.json());

initializeDatabase();


app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/verifications", verificationRoutes);
app.get("/health", (_req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});