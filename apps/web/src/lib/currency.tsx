"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type CurrencyType = "USD" | "INR" | "EUR" | "GBP";

interface CurrencyContextType {
  currency: CurrencyType;
  setCurrency: (c: CurrencyType) => void;
  formatPrice: (priceInUSD: number) => string;
  convertPrice: (priceInUSD: number) => number;
  symbol: string;
}

const RATES: Record<CurrencyType, { rate: number; symbol: string }> = {
  USD: { rate: 1.0, symbol: "$" },
  INR: { rate: 84.0, symbol: "₹" },
  EUR: { rate: 0.92, symbol: "€" },
  GBP: { rate: 0.78, symbol: "£" },
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyType>("USD");

  useEffect(() => {
    const saved = localStorage.getItem("paypilot_currency") as CurrencyType;
    if (saved && RATES[saved]) {
      setCurrencyState(saved);
    }
  }, []);

  const setCurrency = (c: CurrencyType) => {
    setCurrencyState(c);
    localStorage.setItem("paypilot_currency", c);
  };

  const convertPrice = (priceInUSD: number) => {
    const rate = RATES[currency]?.rate || 1.0;
    return Math.round(priceInUSD * rate * 100) / 100;
  };

  const formatPrice = (priceInUSD: number) => {
    const { rate, symbol } = RATES[currency] || RATES.USD;
    const converted = priceInUSD * rate;
    return `${symbol}${converted.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        formatPrice,
        convertPrice,
        symbol: RATES[currency]?.symbol || "$",
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
