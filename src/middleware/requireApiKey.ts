import { Request, Response, NextFunction } from "express";
import { env } from "../lib/env";

/**
 * Middleware que valida la API Key en el header API_KEY
 * Bloquea requests no autorizados con 401
 */
export function requireApiKey(req: Request, res: Response, next: NextFunction) {
  const apiKey = req.headers["API_KEY"];

  if (!apiKey) {
    res.status(401).json({ error: "API key is required" });
    return;
  }

  if (apiKey !== env.API_KEY) {
    res.status(401).json({ error: "Invalid API key" });
    return;
  }

  next();
}
