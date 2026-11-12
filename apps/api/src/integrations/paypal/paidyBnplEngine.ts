export interface BnplPlan {
  provider: "PAYPAL_PAY_IN_4" | "PAIDY_INSTALLMENTS";
  eligible: boolean;
  numberOfPayments: number;
  installmentAmount: number;
  frequency: "BI_WEEKLY" | "MONTHLY";
  interestApr: number; // 0% interest
  totalPayable: number;
  schedule: Array<{ installmentNumber: number; dueDate: string; amount: number }>;
}

/**
 * PayPal Pay in 4 / Paidy Buy Now Pay Later (BNPL) Calculation Engine.
 * Breaks down quotes into 4 interest-free bi-weekly payments.
 */
export function calculateBnplInstallments(totalAmount: number): BnplPlan {
  const eligible = totalAmount >= 30 && totalAmount <= 1500;
  const numberOfPayments = 4;
  const installmentAmount = parseFloat((totalAmount / numberOfPayments).toFixed(2));
  const roundedDiff = parseFloat((totalAmount - installmentAmount * numberOfPayments).toFixed(2));

  const schedule: BnplPlan["schedule"] = [];
  const today = new Date();

  for (let i = 1; i <= numberOfPayments; i++) {
    const dueDate = new Date(today);
    dueDate.setDate(today.getDate() + (i - 1) * 14);
    // Add any fractional penny difference to the first installment
    const amt = i === 1 ? parseFloat((installmentAmount + roundedDiff).toFixed(2)) : installmentAmount;
    schedule.push({
      installmentNumber: i,
      dueDate: dueDate.toISOString().split("T")[0],
      amount: amt,
    });
  }

  return {
    provider: "PAYPAL_PAY_IN_4",
    eligible,
    numberOfPayments,
    installmentAmount,
    frequency: "BI_WEEKLY",
    interestApr: 0.0,
    totalPayable: totalAmount,
    schedule,
  };
}
