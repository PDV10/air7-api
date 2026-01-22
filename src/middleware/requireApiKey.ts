import { Request, Response, NextFunction } from "express";
import { env } from "../lib/env";

/**
 * Middleware that validates the API Key for mutation endpoints.
 * Supports both:
 *   - Authorization: Bearer <token>
 *   - x-api-key: <token>
 * 
 * Returns 401 Unauthorized when missing/invalid API key.
 */
export function requireApiKey(req: Request, res: Response, next: NextFunction) {
  // Support both Authorization header and x-api-key header
  const auth = req.headers.authorization;
  const xApiKey = req.headers["x-api-key"] as string | undefined;
  
  const apiKey = auth?.startsWith("Bearer ") 
    ? auth.slice(7).trim() 
    : xApiKey?.trim();

  if (!apiKey) {
    return res.status(401).json({ error: "Unauthorized: API key is required" });
  }

  if (apiKey !== env.API_KEY) {
    return res.status(401).json({ error: "Unauthorized: Invalid API key" });
  }

  return next();
}

/**
 * Optional hardening middleware for defense in depth.
 * Validates an internal admin header that only the proxy server knows.
 * 
 * Returns 403 Forbidden when the internal header is missing/invalid.
 * 
 * If INTERNAL_ADMIN_SECRET is not configured, this middleware is a no-op.
 */
export function requireInternalAdmin(req: Request, res: Response, next: NextFunction) {
  // If no secret is configured, skip this check
  if (!env.INTERNAL_ADMIN_SECRET) {
    return next();
  }

  const internalHeader = req.headers["x-internal-admin"] as string | undefined;

  if (!internalHeader) {
    return res.status(403).json({ error: "Forbidden: Internal access required" });
  }

  if (internalHeader !== env.INTERNAL_ADMIN_SECRET) {
    return res.status(403).json({ error: "Forbidden: Invalid internal credentials" });
  }

  return next();
}
