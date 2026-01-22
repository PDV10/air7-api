import { Router, Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { requireApiKey } from "../middleware/requireApiKey";
import { upload } from "../middleware/upload";
import {
  uploadBufferToCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinaryUtils";
import {
  createProductSchema,
  updateProductSchema,
} from "../schemas/product.schema";

const router = Router();

const parseFormDataFields = (body: Record<string, unknown>) => {
 
  if (typeof body.sizes === "string") {
    try {
      body.sizes = JSON.parse(body.sizes);
    } catch {
      body.sizes = [];
    }
  }


  if (typeof body.isOnSale === "string") {
    body.isOnSale = body.isOnSale === "true";
  }
};

// Conditional middleware: only run multer for multipart/form-data
const conditionalUpload = (req: Request, res: Response, next: NextFunction) => {
  if (req.is("multipart/form-data")) {
    upload.single("image")(req, res, (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      next();
    });
  } else {
    next();
  }
};

// GET /api/products - List all products
router.get("/", async (_req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// GET /api/products/:id - Get single product
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid product ID" });
      return;
    }

    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    res.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

// POST /api/products - Create product (supports JSON or multipart/form-data with image)
router.post(
  "/",
  requireApiKey,
  conditionalUpload,
  async (req: Request, res: Response) => {
    try {
      // Parse FormData fields that arrive as strings
      parseFormDataFields(req.body);

      const parsed = createProductSchema.safeParse(req.body);

      if (!parsed.success) {
        res.status(400).json({ error: parsed.error.flatten().fieldErrors });
        return;
      }

      let imageUrl: string | undefined;
      let imagePublicId: string | undefined;

      // Handle image upload if file is present
      if (req.file) {
        const uploadResult = await uploadBufferToCloudinary(
          req.file.buffer,
          "air7/products"
        );
        imageUrl = uploadResult.secure_url;
        imagePublicId = uploadResult.public_id;
      }

      const product = await prisma.product.create({
        data: {
          ...parsed.data,
          ...(imageUrl && { imageUrl }),
          ...(imagePublicId && { imagePublicId }),
        },
        include: { category: true },
      });

      res.status(201).json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ error: "Failed to create product" });
    }
  }
);

// PUT /api/products/:id - Update product
router.put("/:id", requireApiKey, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid product ID" });
      return;
    }

    const parsed = updateProductSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten().fieldErrors });
      return;
    }

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    const product = await prisma.product.update({
      where: { id },
      data: parsed.data,
      include: { category: true },
    });

    res.json(product);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ error: "Failed to update product" });
  }
});

// DELETE /api/products/:id - Delete product
router.delete("/:id", requireApiKey, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid product ID" });
      return;
    }

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    // Delete image from Cloudinary if exists
    if (existing.imagePublicId) {
      try {
        await deleteFromCloudinary(existing.imagePublicId);
      } catch (cloudinaryError) {
        console.error("Error deleting image from Cloudinary:", cloudinaryError);
        
      }
    }

    await prisma.product.delete({ where: { id } });

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

export default router;
