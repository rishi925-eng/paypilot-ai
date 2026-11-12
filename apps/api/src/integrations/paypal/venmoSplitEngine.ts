export interface VenmoSplitPayer {
  name: string;
  venmoHandle: string;
  shareAmount: number;
  status: "PAID" | "PENDING_REQUEST";
  venmoDeepLink: string;
}

export interface VenmoSplitCalculation {
  totalAmount: number;
  splitCount: number;
  perPersonAmount: number;
  primaryPayerShare: number;
  payers: VenmoSplitPayer[];
  groupNote: string;
  qrCodeMockUrl: string;
}

/**
 * PayPal Venmo Social Bill-Splitting Engine.
 * Allows buyers to split high-ticket tech or group purchases among friends,
 * generating instant Venmo deep links and QR request codes.
 */
export function calculateVenmoSplit(params: {
  totalAmount: number;
  splitCount?: number;
  orderDescription?: string;
  friends?: Array<{ name: string; venmoHandle: string }>;
}): VenmoSplitCalculation {
  const count = Math.max(2, Math.min(10, params.splitCount || 2));
  const rawShare = Math.floor((params.totalAmount / count) * 100) / 100;
  const roundedDiff = parseFloat((params.totalAmount - rawShare * count).toFixed(2));
  const primaryShare = parseFloat((rawShare + roundedDiff).toFixed(2));

  const defaultFriends = [
    { name: "Jordan (Roommate)", venmoHandle: "@jordan-tech" },
    { name: "Sam (Co-worker)", venmoHandle: "@sam-dev" },
    { name: "Taylor (Friend)", venmoHandle: "@taylor-code" },
  ];

  const payers: VenmoSplitPayer[] = [];

  // Payer 1: Primary Buyer (Initiator)
  payers.push({
    name: "You (Primary Buyer)",
    venmoHandle: "@you-sandbox",
    shareAmount: primaryShare,
    status: "PAID",
    venmoDeepLink: "",
  });

  // Remaining split payers
  for (let i = 1; i < count; i++) {
    const friend = params.friends?.[i - 1] || defaultFriends[(i - 1) % defaultFriends.length];
    const encodedNote = encodeURIComponent(`PayPilot split: ${params.orderDescription || "Developer Hardware"}`);
    const link = `venmo://paycharge?txn=charge&recipients=${friend.venmoHandle.replace("@", "")}&amount=${rawShare}&note=${encodedNote}`;

    payers.push({
      name: friend.name,
      venmoHandle: friend.venmoHandle,
      shareAmount: rawShare,
      status: "PENDING_REQUEST",
      venmoDeepLink: link,
    });
  }

  return {
    totalAmount: params.totalAmount,
    splitCount: count,
    perPersonAmount: rawShare,
    primaryPayerShare: primaryShare,
    payers,
    groupNote: `PayPilot Order Split: ${params.orderDescription || "Tech Gear"}`,
    qrCodeMockUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=venmo-split-${Date.now()}`,
  };
}
