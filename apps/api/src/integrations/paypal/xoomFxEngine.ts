export interface XoomQuote {
  sourceCurrency: "USD";
  targetCurrency: "EUR" | "GBP" | "INR" | "CAD" | "JPY";
  sourceAmountUSD: number;
  exchangeRate: number;
  convertedAmount: number;
  xoomTransferFee: number;
  deliveryMethod: "INSTANT_DEPOSIT" | "PAYPAL_WALLET" | "CASH_PICKUP";
  fxLockDurationMinutes: number;
  formattedTargetAmount: string;
}

const XOOM_FX_RATES: Record<string, number> = {
  EUR: 0.92,
  GBP: 0.79,
  INR: 84.15,
  CAD: 1.37,
  JPY: 152.4,
};

/**
 * PayPal Xoom Cross-Border International Remittance & FX Engine.
 * Enables global developer customers to estimate international purchases
 * with locked exchange rates and transparent transfer fees.
 */
export function calculateXoomCrossBorderQuote(
  amountUSD: number,
  targetCurrency: "EUR" | "GBP" | "INR" | "CAD" | "JPY" = "EUR"
): XoomQuote {
  const rate = XOOM_FX_RATES[targetCurrency] || 1.0;
  const converted = parseFloat((amountUSD * rate).toFixed(2));
  const fee = amountUSD > 200 ? 0.0 : 2.99; // Free Xoom transfers over $200

  const symbols: Record<string, string> = {
    EUR: "€",
    GBP: "£",
    INR: "₹",
    CAD: "CA$",
    JPY: "¥",
  };

  return {
    sourceCurrency: "USD",
    targetCurrency,
    sourceAmountUSD: amountUSD,
    exchangeRate: rate,
    convertedAmount: converted,
    xoomTransferFee: fee,
    deliveryMethod: "PAYPAL_WALLET",
    fxLockDurationMinutes: 120, // 2-hour guaranteed FX rate lock
    formattedTargetAmount: `${symbols[targetCurrency] || ""}${converted.toLocaleString()}`,
  };
}
