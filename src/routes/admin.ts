import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../lib/prisma";

const router = Router();

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

// POST /api/admin/login - Validate admin credentials
router.post("/login", async (req: Request, res: Response) => {
  try {
    const parsed = loginSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({ 
        success: false, 
        error: "Username and password are required" 
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

    // Success - credentials are valid
    res.json({
      success: true,
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

export default router;
