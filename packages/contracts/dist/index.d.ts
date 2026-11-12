import { z } from "zod";
export declare const CurrencySchema: z.ZodDefault<z.ZodEnum<["USD", "INR", "EUR", "GBP"]>>;
export type Currency = z.infer<typeof CurrencySchema>;
export declare const ProductAttributeSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    name: z.ZodString;
    value: z.ZodString;
}, "strip", z.ZodTypeAny, {
    value: string;
    name: string;
    id?: string | undefined;
}, {
    value: string;
    name: string;
    id?: string | undefined;
}>;
export type ProductAttribute = z.infer<typeof ProductAttributeSchema>;
export declare const ProductSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    slug: z.ZodString;
    description: z.ZodString;
    category: z.ZodString;
    price: z.ZodNumber;
    currency: z.ZodDefault<z.ZodEnum<["USD", "INR", "EUR", "GBP"]>>;
    stock: z.ZodNumber;
    imageUrl: z.ZodUnion<[z.ZodString, z.ZodString]>;
    rating: z.ZodDefault<z.ZodNumber>;
    reviewCount: z.ZodDefault<z.ZodNumber>;
    attributes: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        name: z.ZodString;
        value: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        value: string;
        name: string;
        id?: string | undefined;
    }, {
        value: string;
        name: string;
        id?: string | undefined;
    }>, "many">>;
    createdAt: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodDate]>>;
    updatedAt: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodDate]>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    slug: string;
    description: string;
    category: string;
    price: number;
    currency: "USD" | "INR" | "EUR" | "GBP";
    stock: number;
    imageUrl: string;
    rating: number;
    reviewCount: number;
    attributes: {
        value: string;
        name: string;
        id?: string | undefined;
    }[];
    createdAt?: string | Date | undefined;
    updatedAt?: string | Date | undefined;
}, {
    id: string;
    name: string;
    slug: string;
    description: string;
    category: string;
    price: number;
    stock: number;
    imageUrl: string;
    currency?: "USD" | "INR" | "EUR" | "GBP" | undefined;
    rating?: number | undefined;
    reviewCount?: number | undefined;
    attributes?: {
        value: string;
        name: string;
        id?: string | undefined;
    }[] | undefined;
    createdAt?: string | Date | undefined;
    updatedAt?: string | Date | undefined;
}>;
export type Product = z.infer<typeof ProductSchema>;
export declare const CartItemSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    productId: z.ZodString;
    product: z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        slug: z.ZodString;
        description: z.ZodString;
        category: z.ZodString;
        price: z.ZodNumber;
        currency: z.ZodDefault<z.ZodEnum<["USD", "INR", "EUR", "GBP"]>>;
        stock: z.ZodNumber;
        imageUrl: z.ZodUnion<[z.ZodString, z.ZodString]>;
        rating: z.ZodDefault<z.ZodNumber>;
        reviewCount: z.ZodDefault<z.ZodNumber>;
        attributes: z.ZodDefault<z.ZodArray<z.ZodObject<{
            id: z.ZodOptional<z.ZodString>;
            name: z.ZodString;
            value: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            value: string;
            name: string;
            id?: string | undefined;
        }, {
            value: string;
            name: string;
            id?: string | undefined;
        }>, "many">>;
        createdAt: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodDate]>>;
        updatedAt: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodDate]>>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        slug: string;
        description: string;
        category: string;
        price: number;
        currency: "USD" | "INR" | "EUR" | "GBP";
        stock: number;
        imageUrl: string;
        rating: number;
        reviewCount: number;
        attributes: {
            value: string;
            name: string;
            id?: string | undefined;
        }[];
        createdAt?: string | Date | undefined;
        updatedAt?: string | Date | undefined;
    }, {
        id: string;
        name: string;
        slug: string;
        description: string;
        category: string;
        price: number;
        stock: number;
        imageUrl: string;
        currency?: "USD" | "INR" | "EUR" | "GBP" | undefined;
        rating?: number | undefined;
        reviewCount?: number | undefined;
        attributes?: {
            value: string;
            name: string;
            id?: string | undefined;
        }[] | undefined;
        createdAt?: string | Date | undefined;
        updatedAt?: string | Date | undefined;
    }>>;
    quantity: z.ZodNumber;
    unitPrice: z.ZodNumber;
    currency: z.ZodDefault<z.ZodEnum<["USD", "INR", "EUR", "GBP"]>>;
}, "strip", z.ZodTypeAny, {
    currency: "USD" | "INR" | "EUR" | "GBP";
    productId: string;
    quantity: number;
    unitPrice: number;
    id?: string | undefined;
    product?: {
        id: string;
        name: string;
        slug: string;
        description: string;
        category: string;
        price: number;
        currency: "USD" | "INR" | "EUR" | "GBP";
        stock: number;
        imageUrl: string;
        rating: number;
        reviewCount: number;
        attributes: {
            value: string;
            name: string;
            id?: string | undefined;
        }[];
        createdAt?: string | Date | undefined;
        updatedAt?: string | Date | undefined;
    } | undefined;
}, {
    productId: string;
    quantity: number;
    unitPrice: number;
    id?: string | undefined;
    currency?: "USD" | "INR" | "EUR" | "GBP" | undefined;
    product?: {
        id: string;
        name: string;
        slug: string;
        description: string;
        category: string;
        price: number;
        stock: number;
        imageUrl: string;
        currency?: "USD" | "INR" | "EUR" | "GBP" | undefined;
        rating?: number | undefined;
        reviewCount?: number | undefined;
        attributes?: {
            value: string;
            name: string;
            id?: string | undefined;
        }[] | undefined;
        createdAt?: string | Date | undefined;
        updatedAt?: string | Date | undefined;
    } | undefined;
}>;
export type CartItem = z.infer<typeof CartItemSchema>;
export declare const OrderStatusSchema: z.ZodEnum<["DRAFT", "PENDING_APPROVAL", "PAYMENT_PENDING", "COMPLETED", "PAYMENT_REVIEW", "CANCELLED", "FAILED"]>;
export type OrderStatus = z.infer<typeof OrderStatusSchema>;
export declare const PaymentStatusSchema: z.ZodEnum<["CREATED", "SAVED", "APPROVED", "VOIDED", "COMPLETED", "PAYER_ACTION_REQUIRED", "FAILED"]>;
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;
export declare const CreatePayPalOrderRequestSchema: z.ZodObject<{
    orderId: z.ZodOptional<z.ZodString>;
    items: z.ZodArray<z.ZodObject<{
        productId: z.ZodString;
        quantity: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        productId: string;
        quantity: number;
    }, {
        productId: string;
        quantity: number;
    }>, "many">;
    shippingAddress: z.ZodOptional<z.ZodObject<{
        fullName: z.ZodString;
        addressLine1: z.ZodString;
        addressLine2: z.ZodOptional<z.ZodString>;
        city: z.ZodString;
        state: z.ZodString;
        postalCode: z.ZodString;
        countryCode: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        fullName: string;
        addressLine1: string;
        city: string;
        state: string;
        postalCode: string;
        countryCode: string;
        addressLine2?: string | undefined;
    }, {
        fullName: string;
        addressLine1: string;
        city: string;
        state: string;
        postalCode: string;
        addressLine2?: string | undefined;
        countryCode?: string | undefined;
    }>>;
    currency: z.ZodDefault<z.ZodDefault<z.ZodEnum<["USD", "INR", "EUR", "GBP"]>>>;
}, "strip", z.ZodTypeAny, {
    currency: "USD" | "INR" | "EUR" | "GBP";
    items: {
        productId: string;
        quantity: number;
    }[];
    orderId?: string | undefined;
    shippingAddress?: {
        fullName: string;
        addressLine1: string;
        city: string;
        state: string;
        postalCode: string;
        countryCode: string;
        addressLine2?: string | undefined;
    } | undefined;
}, {
    items: {
        productId: string;
        quantity: number;
    }[];
    currency?: "USD" | "INR" | "EUR" | "GBP" | undefined;
    orderId?: string | undefined;
    shippingAddress?: {
        fullName: string;
        addressLine1: string;
        city: string;
        state: string;
        postalCode: string;
        addressLine2?: string | undefined;
        countryCode?: string | undefined;
    } | undefined;
}>;
export type CreatePayPalOrderRequest = z.input<typeof CreatePayPalOrderRequestSchema>;
export declare const CapturePayPalOrderRequestSchema: z.ZodObject<{
    orderId: z.ZodString;
    paypalOrderId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    orderId: string;
    paypalOrderId: string;
}, {
    orderId: string;
    paypalOrderId: string;
}>;
export type CapturePayPalOrderRequest = z.infer<typeof CapturePayPalOrderRequestSchema>;
export declare const SearchProductsInputSchema: z.ZodObject<{
    query: z.ZodOptional<z.ZodString>;
    category: z.ZodOptional<z.ZodString>;
    maxPrice: z.ZodOptional<z.ZodNumber>;
    minPrice: z.ZodOptional<z.ZodNumber>;
    currency: z.ZodDefault<z.ZodOptional<z.ZodDefault<z.ZodEnum<["USD", "INR", "EUR", "GBP"]>>>>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    currency: "USD" | "INR" | "EUR" | "GBP";
    limit: number;
    category?: string | undefined;
    query?: string | undefined;
    maxPrice?: number | undefined;
    minPrice?: number | undefined;
}, {
    category?: string | undefined;
    currency?: "USD" | "INR" | "EUR" | "GBP" | undefined;
    query?: string | undefined;
    maxPrice?: number | undefined;
    minPrice?: number | undefined;
    limit?: number | undefined;
}>;
export type SearchProductsInput = z.input<typeof SearchProductsInputSchema>;
export declare const CompareProductsInputSchema: z.ZodObject<{
    productIds: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    productIds: string[];
}, {
    productIds: string[];
}>;
export type CompareProductsInput = z.infer<typeof CompareProductsInputSchema>;
export declare const CheckBudgetInputSchema: z.ZodObject<{
    items: z.ZodArray<z.ZodObject<{
        productId: z.ZodString;
        quantity: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        productId: string;
        quantity: number;
    }, {
        productId: string;
        quantity?: number | undefined;
    }>, "many">;
    budget: z.ZodNumber;
    currency: z.ZodDefault<z.ZodDefault<z.ZodEnum<["USD", "INR", "EUR", "GBP"]>>>;
}, "strip", z.ZodTypeAny, {
    currency: "USD" | "INR" | "EUR" | "GBP";
    items: {
        productId: string;
        quantity: number;
    }[];
    budget: number;
}, {
    items: {
        productId: string;
        quantity?: number | undefined;
    }[];
    budget: number;
    currency?: "USD" | "INR" | "EUR" | "GBP" | undefined;
}>;
export type CheckBudgetInput = z.input<typeof CheckBudgetInputSchema>;
export declare const PrepareOrderInputSchema: z.ZodObject<{
    items: z.ZodArray<z.ZodObject<{
        productId: z.ZodString;
        quantity: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        productId: string;
        quantity: number;
    }, {
        productId: string;
        quantity: number;
    }>, "many">;
    currency: z.ZodDefault<z.ZodDefault<z.ZodEnum<["USD", "INR", "EUR", "GBP"]>>>;
}, "strip", z.ZodTypeAny, {
    currency: "USD" | "INR" | "EUR" | "GBP";
    items: {
        productId: string;
        quantity: number;
    }[];
}, {
    items: {
        productId: string;
        quantity: number;
    }[];
    currency?: "USD" | "INR" | "EUR" | "GBP" | undefined;
}>;
export type PrepareOrderInput = z.input<typeof PrepareOrderInputSchema>;
export declare const OrderQuoteSchema: z.ZodObject<{
    quoteId: z.ZodString;
    items: z.ZodArray<z.ZodObject<{
        productId: z.ZodString;
        productName: z.ZodString;
        quantity: z.ZodNumber;
        unitPrice: z.ZodNumber;
        lineTotal: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        productId: string;
        quantity: number;
        unitPrice: number;
        productName: string;
        lineTotal: number;
    }, {
        productId: string;
        quantity: number;
        unitPrice: number;
        productName: string;
        lineTotal: number;
    }>, "many">;
    subtotal: z.ZodNumber;
    discountAmount: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    couponCode: z.ZodOptional<z.ZodString>;
    honeyCashback: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    similityRiskScore: z.ZodOptional<z.ZodNumber>;
    similityDecision: z.ZodOptional<z.ZodString>;
    bnplInstallment: z.ZodOptional<z.ZodNumber>;
    zettleStoresAvailable: z.ZodOptional<z.ZodNumber>;
    tax: z.ZodNumber;
    shipping: z.ZodNumber;
    total: z.ZodNumber;
    currency: z.ZodDefault<z.ZodEnum<["USD", "INR", "EUR", "GBP"]>>;
    expiresAt: z.ZodString;
    requiresUserApproval: z.ZodLiteral<true>;
}, "strip", z.ZodTypeAny, {
    currency: "USD" | "INR" | "EUR" | "GBP";
    items: {
        productId: string;
        quantity: number;
        unitPrice: number;
        productName: string;
        lineTotal: number;
    }[];
    quoteId: string;
    subtotal: number;
    discountAmount: number;
    honeyCashback: number;
    tax: number;
    shipping: number;
    total: number;
    expiresAt: string;
    requiresUserApproval: true;
    couponCode?: string | undefined;
    similityRiskScore?: number | undefined;
    similityDecision?: string | undefined;
    bnplInstallment?: number | undefined;
    zettleStoresAvailable?: number | undefined;
}, {
    items: {
        productId: string;
        quantity: number;
        unitPrice: number;
        productName: string;
        lineTotal: number;
    }[];
    quoteId: string;
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
    expiresAt: string;
    requiresUserApproval: true;
    currency?: "USD" | "INR" | "EUR" | "GBP" | undefined;
    discountAmount?: number | undefined;
    couponCode?: string | undefined;
    honeyCashback?: number | undefined;
    similityRiskScore?: number | undefined;
    similityDecision?: string | undefined;
    bnplInstallment?: number | undefined;
    zettleStoresAvailable?: number | undefined;
}>;
export type OrderQuote = z.infer<typeof OrderQuoteSchema>;
//# sourceMappingURL=index.d.ts.map