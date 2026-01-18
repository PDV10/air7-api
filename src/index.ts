import express, { Request, Response } from "express";
import cors from "cors";
import { env } from "./lib/env";
import productsRouter from "./routes/products";
import categoriesRouter from "./routes/categories";
import uploadsRouter from "./routes/uploads";

const app = express();

// Middleware
app.use(express.json());

// CORS configuration
app.use(
  cors({
    origin: [process.env.CORS_ORIGIN ?? "http://localhost:5173", "https://air7.vercel.app"],
    credentials: true,
  })
);

// Health check endpoint
app.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Routes
app.use("/api/products", productsRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/uploads", uploadsRouter);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Not found" });
});

// Start server
app.listen(env.PORT, () => {
  console.log(`🚀 Server running on http://localhost:${env.PORT}`);
  console.log(`📋 Health check: http://localhost:${env.PORT}/health`);
});
