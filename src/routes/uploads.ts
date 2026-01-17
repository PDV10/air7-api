import { Router, Request, Response } from "express";
import crypto from "crypto";
import { env } from "../lib/env";

const router = Router();

// POST /api/uploads/signature - Get Cloudinary signature for direct upload
router.post("/signature", async (_req: Request, res: Response) => {
  try {
    const timestamp = Math.round(Date.now() / 1000);
    const folder = "air7/products";

    // Create the string to sign
    const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;

    // Generate SHA1 signature
    const signature = crypto
      .createHash("sha1")
      .update(paramsToSign + env.CLOUDINARY_API_SECRET)
      .digest("hex");

    res.json({
      timestamp,
      folder,
      signature,
      cloudName: env.CLOUDINARY_CLOUD_NAME,
      apiKey: env.CLOUDINARY_API_KEY,
    });
  } catch (error) {
    console.error("Error generating upload signature:", error);
    res.status(500).json({ error: "Failed to generate upload signature" });
  }
});

export default router;
