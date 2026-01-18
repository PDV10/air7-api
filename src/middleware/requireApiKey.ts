import { Request, Response, NextFunction } from "express";
import { env } from "../lib/env";

/**
 * Middleware que valida la API Key en el header Authorization: Bearer <token>
 * Bloquea requests no autorizados con 401
 */
export function requireApiKey(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization; 
  const apiKey = auth?.startsWith("Bearer ") ? auth.slice(7).trim() : undefined;

  if (!apiKey) {
    return res.status(401).json({ error: "API key is required" });
  }

  if (apiKey !== env.API_KEY) {
    return res.status(401).json({ error: "Invalid API key" });
  }

  return next();
}
