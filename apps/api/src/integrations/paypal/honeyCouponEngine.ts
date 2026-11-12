import { logger } from "../../config/logger.js";

export interface HoneyCoupon {
  code: string;
  description: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT" | "FREE_SHIPPING";
  value: number; // e.g. 20 for 20%, 15 for $15 off
  minSubtotal?: number;
  maxDiscount?: number;
  applicableCategories?: string[];
}

const HONEY_PROMO_REGISTRY: HoneyCoupon[] = [
  {
    code: "HONEY20",
    description: "PayPal Honey Community 20% Off Premier Developer Gear",
    discountType: "PERCENTAGE",
    value: 20,
    minSubtotal: 100,
    maxDiscount: 100,
  },
  {
    code: "PAYPALAI",
    description: "PayPal AI Hackathon Special: $25 Off Tech Orders",
    discountType: "FIXED_AMOUNT",
    value: 25,
    minSubtotal: 150,
  },
  {
    code: "DEVPOST10",
    description: "Devpost Innovators: 10% Off Instant Discount",
    discountType: "PERCENTAGE",
    value: 10,
    minSubtotal: 50,
  },
  {
    code: "FREESHIP",
    description: "PayPal Express Free Shipping Perk",
    discountType: "FREE_SHIPPING",
    value: 15,
  },
];

export interface HoneyOptimizationResult {
  bestCoupon: HoneyCoupon | null;
  originalSubtotal: number;
  discountAmount: number;
  newSubtotal: number;
  savingsPercentage: number;
  allTestedCodes: Array<{ code: string; valid: boolean; savings: number; reason: string }>;
  honeyCashbackEarned: number; // 2% PayPal Honey gold rewards
}

/**
 * PayPal Honey Smart Coupon & Best-Price Optimizer.
 * Automatically discovers, simulates, and applies the highest savings coupon
 * for a customer's order.
 */
export async function optimizeWithHoney(
  subtotal: number,
  category?: string
): Promise<HoneyOptimizationResult> {
  const tested: HoneyOptimizationResult["allTestedCodes"] = [];
  let bestCoupon: HoneyCoupon | null = null;
  let maxSavings = 0;

  for (const coupon of HONEY_PROMO_REGISTRY) {
    if (coupon.minSubtotal && subtotal < coupon.minSubtotal) {
      tested.push({
        code: coupon.code,
        valid: false,
        savings: 0,
        reason: `Requires minimum order of $${coupon.minSubtotal}`,
      });
      continue;
    }

    let savings = 0;
    if (coupon.discountType === "PERCENTAGE") {
      savings = (subtotal * coupon.value) / 100;
      if (coupon.maxDiscount && savings > coupon.maxDiscount) {
        savings = coupon.maxDiscount;
      }
    } else if (coupon.discountType === "FIXED_AMOUNT") {
      savings = Math.min(coupon.value, subtotal);
    } else if (coupon.discountType === "FREE_SHIPPING") {
      savings = 15; // standard shipping value
    }

    tested.push({
      code: coupon.code,
      valid: true,
      savings: parseFloat(savings.toFixed(2)),
      reason: coupon.description,
    });

    if (savings > maxSavings) {
      maxSavings = savings;
      bestCoupon = coupon;
    }
  }

  const finalSavings = parseFloat(maxSavings.toFixed(2));
  const newSubtotal = parseFloat(Math.max(0, subtotal - finalSavings).toFixed(2));
  const savingsPercent = subtotal > 0 ? Math.round((finalSavings / subtotal) * 100) : 0;
  const honeyCashback = parseFloat((newSubtotal * 0.02).toFixed(2)); // 2% Honey reward points

  logger.info({ originalSubtotal: subtotal, bestCoupon: bestCoupon?.code, finalSavings }, "[PayPal Honey] Best coupon optimized");

  return {
    bestCoupon,
    originalSubtotal: subtotal,
    discountAmount: finalSavings,
    newSubtotal,
    savingsPercentage: savingsPercent,
    allTestedCodes: tested,
    honeyCashbackEarned: honeyCashback,
  };
}
