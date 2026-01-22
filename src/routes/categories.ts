import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { requireApiKey, requireInternalAdmin } from "../middleware/requireApiKey";
import {
  createCategorySchema,
  updateCategorySchema,
} from "../schemas/category.schema";

const router = Router();

// GET /api/categories - List all categories
router.get("/", async (_req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
    });
    res.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// GET /api/categories/:id - Get single category
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid category ID" });
      return;
    }

    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      res.status(404).json({ error: "Category not found" });
      return;
    }

    res.json(category);
  } catch (error) {
    console.error("Error fetching category:", error);
    res.status(500).json({ error: "Failed to fetch category" });
  }
});

// GET /api/categories/:id/products - Get products by category
router.get("/:id/products", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid category ID" });
      return;
    }

    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) {
      res.status(404).json({ error: "Category not found" });
      return;
    }

    const products = await prisma.product.findMany({
      where: { categoryId: id },
      orderBy: { createdAt: "desc" },
    });

    res.json(products);
  } catch (error) {
    console.error("Error fetching category products:", error);
    res.status(500).json({ error: "Failed to fetch category products" });
  }
});

// POST /api/categories - Create category
router.post("/", requireApiKey, requireInternalAdmin, async (req: Request, res: Response) => {
  try {
    const parsed = createCategorySchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten().fieldErrors });
      return;
    }

    const category = await prisma.category.create({
      data: parsed.data,
    });

    res.status(201).json(category);
  } catch (error: any) {
    if (error?.code === "P2002") {
      res.status(409).json({ error: "Category name already exists" });
      return;
    }
    console.error("Error creating category:", error);
    res.status(500).json({ error: "Failed to create category" });
  }
});

// PUT /api/categories/:id - Update category
router.put("/:id", requireApiKey, requireInternalAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid category ID" });
      return;
    }

    const parsed = updateCategorySchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten().fieldErrors });
      return;
    }

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: "Category not found" });
      return;
    }

    const category = await prisma.category.update({
      where: { id },
      data: parsed.data,
    });

    res.json(category);
  } catch (error: any) {
    if (error?.code === "P2002") {
      res.status(409).json({ error: "Category name already exists" });
      return;
    }
    console.error("Error updating category:", error);
    res.status(500).json({ error: "Failed to update category" });
  }
});

// DELETE /api/categories/:id - Delete category
router.delete("/:id", requireApiKey, requireInternalAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid category ID" });
      return;
    }

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: "Category not found" });
      return;
    }

    await prisma.category.delete({ where: { id } });

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ error: "Failed to delete category" });
  }
});

export default router;
