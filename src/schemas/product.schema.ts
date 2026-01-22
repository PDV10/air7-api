import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  price: z.coerce.number().positive("Price must be positive"),
  stock: z.coerce.number().int().nonnegative("Stock must be non-negative").optional(),
  gender: z.string().nullable().optional(),
  imageUrl: z.string().url("Invalid image URL").nullable().optional(),
  imagePublicId: z.string().nullable().optional(),
  brand: z.string().optional(),
  categoryId: z.coerce.number().int().positive("Invalid category ID").optional(),
  sizes: z.array(z.string()).optional(),
  isOnSale: z.coerce.boolean().optional(),
  salePrice: z.coerce.number().positive("Sale price must be positive").nullable().optional(),
});

export const updateProductSchema = createProductSchema.partial();

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
