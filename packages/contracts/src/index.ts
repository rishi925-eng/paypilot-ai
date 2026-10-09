import { z } from "zod";

// Currency
export const CurrencySchema = z.enum(["USD", "INR", "EUR", "GBP"]).default("USD");
export type Currency = z.infer<typeof CurrencySchema>;

// Product Attribute Schema
export const ProductAttributeSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  value: z.string().min(1),
});
export type ProductAttribute = z.infer<typeof ProductAttributeSchema>;

// Product Schema
export const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  category: z.string(),
  price: z.number().positive(),
  currency: CurrencySchema,
  stock: z.number().int().nonnegative(),
  imageUrl: z.string().url().or(z.string()),
  rating: z.number().min(0).max(5).default(4.5),
  reviewCount: z.number().int().nonnegative().default(0),
  attributes: z.array(ProductAttributeSchema).default([]),
  createdAt: z.string().or(z.date()).optional(),
  updatedAt: z.string().or(z.date()).optional(),
});
export type Product = z.infer<typeof ProductSchema>;

// Cart Item Schema
export const CartItemSchema = z.object({
  id: z.string().optional(),
  productId: z.string(),
  product: ProductSchema.optional(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().positive(),
  currency: CurrencySchema,
});
export type CartItem = z.infer<typeof CartItemSchema>;

// Order Status Enum
export const OrderStatusSchema = z.enum([
  "DRAFT",
  "PENDING_APPROVAL",
  "PAYMENT_PENDING",
  "COMPLETED",
  "PAYMENT_REVIEW",
  "CANCELLED",
  "FAILED",
]);
export type OrderStatus = z.infer<typeof OrderStatusSchema>;

// Payment Status Enum
export const PaymentStatusSchema = z.enum([
  "CREATED",
  "SAVED",
  "APPROVED",
  "VOIDED",
  "COMPLETED",
  "PAYER_ACTION_REQUIRED",
  "FAILED",
]);
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;

// Create PayPal Order Request
export const CreatePayPalOrderRequestSchema = z.object({
  orderId: z.string().optional(),
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int().positive(),
    })
  ).min(1),
  shippingAddress: z.object({
    fullName: z.string().min(2),
    addressLine1: z.string().min(3),
    addressLine2: z.string().optional(),
    city: z.string().min(2),
    state: z.string().min(2),
    postalCode: z.string().min(2),
    countryCode: z.string().length(2).default("US"),
  }).optional(),
  currency: CurrencySchema.default("USD"),
});
export type CreatePayPalOrderRequest = z.infer<typeof CreatePayPalOrderRequestSchema>;

// Capture PayPal Order Request
export const CapturePayPalOrderRequestSchema = z.object({
  orderId: z.string(),
  paypalOrderId: z.string().min(1),
});
export type CapturePayPalOrderRequest = z.infer<typeof CapturePayPalOrderRequestSchema>;

// AI Tool Inputs & Outputs
export const SearchProductsInputSchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  maxPrice: z.number().positive().optional(),
  minPrice: z.number().nonnegative().optional(),
  currency: CurrencySchema.optional().default("USD"),
  limit: z.number().int().positive().max(20).default(5),
});
export type SearchProductsInput = z.infer<typeof SearchProductsInputSchema>;

export const CompareProductsInputSchema = z.object({
  productIds: z.array(z.string()).min(2).max(4),
});
export type CompareProductsInput = z.infer<typeof CompareProductsInputSchema>;

export const CheckBudgetInputSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int().positive().default(1),
    })
  ),
  budget: z.number().positive(),
  currency: CurrencySchema.default("USD"),
});
export type CheckBudgetInput = z.infer<typeof CheckBudgetInputSchema>;

export const PrepareOrderInputSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int().positive(),
    })
  ).min(1),
  currency: CurrencySchema.default("USD"),
});
export type PrepareOrderInput = z.infer<typeof PrepareOrderInputSchema>;

export const OrderQuoteSchema = z.object({
  quoteId: z.string(),
  items: z.array(
    z.object({
      productId: z.string(),
      productName: z.string(),
      quantity: z.number(),
      unitPrice: z.number(),
      lineTotal: z.number(),
    })
  ),
  subtotal: z.number(),
  tax: z.number(),
  shipping: z.number(),
  total: z.number(),
  currency: CurrencySchema,
  expiresAt: z.string(),
  requiresUserApproval: z.literal(true),
});
export type OrderQuote = z.infer<typeof OrderQuoteSchema>;
