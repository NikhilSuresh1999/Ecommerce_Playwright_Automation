import { z } from 'zod';

export const ProductSpecSchema = z.object({
  id: z.string().min(1),
  product_id: z.string().min(1),
  spec_name: z.string().min(1),
  spec_value: z.string().min(1),
  spec_unit: z.string().nullable(),
});

export const BrandSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().optional(),
});

export const CategorySchema: z.ZodType<{
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  sub_categories?: unknown[];
}> = z.lazy(() =>
  z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    slug: z.string().min(1),
    parent_id: z.string().nullable(),
    sub_categories: z.array(CategorySchema).optional(),
  })
);

export const ProductSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().positive(),
  is_location_offer: z.boolean(),
  is_rental: z.boolean(),
  co2_rating: z.enum(['A', 'B', 'C', 'D', 'E']),
  in_stock: z.boolean(),
  is_eco_friendly: z.boolean(),
  product_image: z.object({
    id: z.string().min(1),
    file_name: z.string().min(1),
    title: z.string().min(1),
  }),
  category: z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    slug: z.string().min(1),
  }),
  brand: BrandSchema,
  specs: z.array(ProductSpecSchema).optional(),
});

export const PaginatedProductListSchema = z.object({
  current_page: z.number().int().positive(),
  data: z.array(ProductSchema),
  from: z.number().int().nonnegative().nullable(),
  last_page: z.number().int().positive(),
  per_page: z.number().int().positive(),
  to: z.number().int().nonnegative().nullable(),
  total: z.number().int().nonnegative(),
});

export const CartItemSchema = z.object({
  id: z.string().min(1),
  quantity: z.number().int().positive(),
  discount_percentage: z.number().nullable(),
  cart_id: z.string().min(1),
  product_id: z.string().min(1),
  product: ProductSchema,
});

export const CartSchema = z.object({
  id: z.string().min(1),
  additional_discount_percentage: z.number().nullable(),
  lat: z.number().nullable(),
  lng: z.number().nullable(),
  cart_items: z.array(CartItemSchema),
});

export const AuthLoginResponseSchema = z.object({
  access_token: z.string().min(20),
  token_type: z.literal('bearer'),
  expires_in: z.number().int().positive(),
});

export const InvoiceSchema = z.object({
  id: z.string().min(1),
  invoice_number: z.string().regex(/^INV-\d+$/),
  invoice_date: z.string().min(1),
  total: z.number().positive(),
  payment_method: z.string().min(1),
  billing_street: z.string().min(1),
  billing_city: z.string().min(1),
  billing_country: z.string().min(1),
  billing_postal_code: z.string().min(1),
});

