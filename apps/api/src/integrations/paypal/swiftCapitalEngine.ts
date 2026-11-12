export interface SwiftWorkingCapitalOffer {
  eligible: boolean;
  maxAdvanceAmount: number;
  fixedFee: number;
  totalRepayment: number;
  repaymentPercentage: number; // e.g. 10% or 15% of daily PayPal sales
  estimatedRepaymentDays: number;
  qualifyingMetrics: {
    thirtyDayVerifiedSales: number;
    completedTransactions: number;
    disputeRatePercentage: number;
  };
  recommendation: string;
}

/**
 * PayPal Swift Financial (PayPal Working Capital) Engine.
 * Evaluates live merchant transaction volume in the PayPal sandbox
 * and calculates automated pre-approved business working capital advances.
 */
export function evaluateSwiftWorkingCapital(params: {
  thirtyDaySales: number;
  orderCount: number;
  disputeCount?: number;
}): SwiftWorkingCapitalOffer {
  const { thirtyDaySales, orderCount, disputeCount = 0 } = params;
  const disputeRate = orderCount > 0 ? (disputeCount / orderCount) * 100 : 0;

  // PayPal Swift Financial requirement: minimum sales activity and low dispute rate
  const eligible = thirtyDaySales >= 500 && disputeRate < 1.0;

  // Pre-approved loan sizing: up to 35% of projected annual sales volume
  const maxAdvance = eligible ? Math.min(50000, Math.round(thirtyDaySales * 3.5)) : 0;
  const fixedFee = Math.round(maxAdvance * 0.052); // 5.2% fixed one-time fee
  const totalRepayment = maxAdvance + fixedFee;

  return {
    eligible,
    maxAdvanceAmount: maxAdvance,
    fixedFee,
    totalRepayment,
    repaymentPercentage: 10, // 10% withheld automatically from future PayPal captures
    estimatedRepaymentDays: 180,
    qualifyingMetrics: {
      thirtyDayVerifiedSales: thirtyDaySales,
      completedTransactions: orderCount,
      disputeRatePercentage: parseFloat(disputeRate.toFixed(2)),
    },
    recommendation: eligible
      ? `🎉 Congratulations! Based on your verified PayPal Sandbox transaction telemetry ($${thirtyDaySales.toFixed(2)} sales), your store qualifies for up to $${maxAdvance.toLocaleString()} in PayPal Swift Working Capital with no credit bureau check and automated repayment from sales.`
      : "Store requires at least $500 in verified PayPal sandbox sales volume to unlock Swift Working Capital.",
  };
}
