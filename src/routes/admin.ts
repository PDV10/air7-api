import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { env } from "../lib/env";

const router = Router();

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

// POST /api/admin/login - Admin login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const parsed = loginSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({ 
        success: false, 
        error: parsed.error.flatten().fieldErrors 
      });
      return;
    }

    const { username, password } = parsed.data;

    // Find admin by username
    const admin = await prisma.admin.findUnique({
      where: { username },
    });

    if (!admin) {
      res.status(401).json({ 
        success: false, 
        error: "Invalid credentials" 
      });
      return;
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, admin.password);

    if (!isValidPassword) {
      res.status(401).json({ 
        success: false, 
        error: "Invalid credentials" 
      });
      return;
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: admin.id, 
        username: admin.username 
      },
      env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      success: true,
      token,
      admin: {
        id: admin.id,
        username: admin.username,
      },
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ 
      success: false, 
      error: "Login failed" 
    });
  }
});

// GET /api/admin/verify - Verify JWT token
router.get("/verify", async (req: Request, res: Response) => {
  try {
    const auth = req.headers.authorization;
    const token = auth?.startsWith("Bearer ") ? auth.slice(7).trim() : undefined;

    if (!token) {
      res.status(401).json({ 
        success: false, 
        error: "Token required" 
      });
      return;
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as { id: number; username: string };

    // Verify admin still exists
    const admin = await prisma.admin.findUnique({
      where: { id: decoded.id },
    });

    if (!admin) {
      res.status(401).json({ 
        success: false, 
        error: "Admin not found" 
      });
      return;
    }

    res.json({
      success: true,
      admin: {
        id: admin.id,
        username: admin.username,
      },
    });
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      error: "Invalid token" 
    });
  }
});

export default router;
