"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Bot,
  Send,
  X,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  Clock,
  Layers,
  Scale,
  DollarSign,
  TrendingDown,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Users,
  Globe,
  Zap,
  Tag,
  Building,
  HelpCircle,
} from "lucide-react";
import { fetchApi } from "../lib/api";
import { useRouter } from "next/navigation";
import { useCurrency } from "../lib/currency";
import { useToast } from "../lib/toast";

interface Message {
  role: "user" | "assistant";
  content: string;
  toolInvocations?: Array<{
    name: string;
    input: any;
    result: any;
  }>;
  quote?: any;
  venmoSplit?: any;
  xoomQuote?: any;
  swiftOffer?: any;
  suggestedActions?: string[];
}

function renderFormattedText(text: string) {
  if (!text) return null;

  const lines = text.split("\n");

  return (
    <div className="space-y-1.5 leading-relaxed">
      {lines.map((line, lineIdx) => {
        if (!line.trim()) {
          return <div key={lineIdx} className="h-1" />;
        }

        const elements: React.ReactNode[] = [];
        let remaining = line;
        let tokenKey = 0;

        // Matches **bold**, `code`, or *italic*
        const tokenRegex = /(\*\*([^*]+)\*\*|`([^`]+)`|\*([^*]+)\*)/;

        while (remaining.length > 0) {
          const match = remaining.match(tokenRegex);
          if (!match || match.index === undefined) {
            elements.push(remaining.replace(/\*\*/g, ""));
            break;
          }

          if (match.index > 0) {
            elements.push(remaining.substring(0, match.index).replace(/\*\*/g, ""));
          }

          const matchedStr = match[0];
          if (matchedStr.startsWith("**") && matchedStr.endsWith("**")) {
            elements.push(
              <strong key={tokenKey++} className="font-extrabold text-white">
                {match[2]}
              </strong>
            );
          } else if (matchedStr.startsWith("`") && matchedStr.endsWith("`")) {
            elements.push(
              <code
                key={tokenKey++}
                className="bg-slate-800 text-cyan-300 px-1.5 py-0.5 rounded text-[11px] font-mono font-bold border border-slate-700/60"
              >
                {match[3]}
              </code>
            );
          } else if (matchedStr.startsWith("*") && matchedStr.endsWith("*")) {
            elements.push(
              <em key={tokenKey++} className="italic text-slate-300 font-medium">
                {match[4]}
              </em>
            );
          }

          remaining = remaining.substring(match.index + matchedStr.length);
        }

        return (
          <p key={lineIdx} className="min-h-[1.25rem]">
            {elements}
          </p>
        );
      })}
    </div>
  );
}

export default function AIAssistantModal({
  isOpen,
  onClose,
  initialQuery,
}: {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}) {
  const { formatPrice } = useCurrency();
  const { toast } = useToast();
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "👋 Welcome to **PayPilot Agentic Copilot Pro**! I orchestrate multi-step autonomous commerce workflows across the complete **PayPal Developer Suite**:\n\n• 🍯 **PayPal Honey**: Auto-discovers verified promo codes (`HONEY20`, `PAYPALAI`).\n• 🛡️ **PayPal Simility AI**: Real-time fraud velocity & bot scoring.\n• 🏬 **PayPal Zettle POS**: Omnichannel physical retail & warehouse stock sync.\n• 👥 **Venmo**: Instant social bill-splitting with friends.\n• 🌍 **PayPal Xoom**: Cross-border international FX rate locking.\n• 💳 **PayPal Sandbox & Pay in 4**: Zero-trust authoritative payment capture.",
      suggestedActions: [
        "⚡ Run Agentic Auto-Pilot (Honey + Simility + PayPal Quote)",
        "👥 Split Sony XM5 with 2 friends via Venmo",
        "🌍 What is the price in Euros via PayPal Xoom FX?",
        "Compare Sony WH-1000XM5 vs Bose QC45",
      ],
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  // Close on Escape key & lock background scroll
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);
  const [isListening, setIsListening] = useState(false);
  const [voiceOutputEnabled, setVoiceOutputEnabled] = useState(false);
  const [quoteSecondsLeft, setQuoteSecondsLeft] = useState(900); // 15 min countdown
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const speakText = (text: string) => {
    if (!voiceOutputEnabled || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const cleanText = text
        .replace(/\*\*([^*]+)\*\*/g, "$1")
        .replace(/\*([^*]+)\*/g, "$1")
        .replace(/`([^`]+)`/g, "$1")
        .replace(/•/g, "")
        .replace(/[^\w\s.,$!?-]/gi, " ")
        .slice(0, 240);

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    const timer = setInterval(() => {
      setQuoteSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Multi-step reasoning trace timer
  useEffect(() => {
    let interval: any = null;
    if (loading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev < 4 ? prev + 1 : prev));
      }, 700);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const reasoningSteps = [
    "🧠 Analyzing intent & technical hardware specifications...",
    "🏬 Querying PayPal Zettle POS omnichannel stock ledger...",
    "🍯 Scanning PayPal Honey promo registry for maximal savings...",
    "🛡️ Evaluating PayPal Simility AI fraud & anomaly heuristics...",
    "🔒 Generating zero-trust cryptographic order quote...",
  ];

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const handleToggleVoice = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast("Speech recognition is not supported in this browser", "info");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        toast("Listening... speak your commerce request", "info");
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
        handleSend(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg: Message = { role: "user", content: query };
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setLoading(true);

    try {
      const data = await fetchApi("/api/ai/chat", {
        method: "POST",
        body: JSON.stringify({ message: query }),
      });

      const botMsg: Message = {
        role: "assistant",
        content: data.reply,
        toolInvocations: data.toolInvocations,
        quote: data.quote,
        venmoSplit: data.venmoSplit,
        xoomQuote: data.xoomQuote,
        swiftOffer: data.swiftOffer,
        suggestedActions: data.suggestedActions,
      };

      setMessages((prev) => [...prev, botMsg]);
      speakText(data.reply);
      if (data.quote) {
        setQuoteSecondsLeft(900);
        toast("Server quote locked with zero-trust pricing!", "success");
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "❌ Failed to connect to AI engine. Ensure Express API is running.",
        },
      ]);
      toast("AI connection error", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && initialQuery) {
      handleSend(initialQuery);
    }
  }, [isOpen, initialQuery]);

  const handleProceedQuote = async (quote: any) => {
    try {
      for (const item of quote.items) {
        await fetchApi("/api/cart/items", {
          method: "POST",
          body: JSON.stringify({ productId: item.productId, quantity: item.quantity }),
        });
      }
      if (quote.couponCode) {
        localStorage.setItem("paypilot_applied_coupon", quote.couponCode);
      }
      toast("Quote transferred to Cart! Proceeding to PayPal Sandbox.", "success");
      onClose();
      router.push("/checkout");
    } catch (e: any) {
      alert("Error transferring quote: " + e.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200"
    >
      <div className="bg-slate-900 border border-slate-700/80 w-full max-w-2xl h-[720px] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 via-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
                <Bot className="w-5 h-5" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-slate-900 rounded-full"></div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-base text-white tracking-tight">PayPilot Copilot Pro</h3>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center">
                  <ShieldCheck className="w-3 h-3 mr-1" /> PayPal Suite Armed
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Honey • Simility • Zettle • Venmo • Paidy • Xoom</p>
            </div>
          </div>
          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => {
                const nextState = !voiceOutputEnabled;
                setVoiceOutputEnabled(nextState);
                if (!nextState && typeof window !== "undefined") {
                  window.speechSynthesis?.cancel();
                }
                toast(nextState ? "AI Voice Audio Response Enabled" : "AI Voice Audio Muted", "info");
              }}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                voiceOutputEnabled
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
              title={voiceOutputEnabled ? "Mute Spoken Voice Output" : "Enable Two-Way Spoken Voice Response"}
            >
              {voiceOutputEnabled ? (
                <Volume2 className="w-4 h-4 text-cyan-400 animate-pulse" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-950/50">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[92%] rounded-2xl p-4 text-xs sm:text-sm shadow-md transition-all ${
                  msg.role === "user"
                    ? "bg-gradient-to-r from-brand-600 to-cyan-600 text-white rounded-br-none"
                    : "bg-slate-900/90 text-slate-200 border border-slate-800 rounded-bl-none"
                }`}
              >
                {/* Tool Invocation Badges */}
                {msg.toolInvocations && msg.toolInvocations.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3 pb-2.5 border-b border-slate-800">
                    {msg.toolInvocations.map((t, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-mono bg-brand-950/80 text-cyan-300 border border-cyan-500/30 font-bold"
                      >
                        ⚡ {t.name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Generative UI: Comparison Table Widget */}
                {msg.toolInvocations?.some((t) => t.name === "compare_products" && t.result?.comparison) && (
                  <div className="my-3 bg-slate-950 rounded-2xl p-3.5 border border-slate-800 overflow-x-auto">
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-cyan-400 mb-2">
                      <Scale className="w-3.5 h-3.5" />
                      <span>Live Specification Comparison Matrix</span>
                    </div>
                    <table className="w-full text-left text-[11px]">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400">
                          <th className="pb-2">Model</th>
                          <th className="pb-2">Price</th>
                          <th className="pb-2">Battery / Specs</th>
                          <th className="pb-2">Rating</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-900">
                        {msg.toolInvocations
                          .find((t) => t.name === "compare_products")
                          ?.result.comparison.map((item: any, idx: number) => (
                            <tr key={idx} className="hover:bg-slate-900/50">
                              <td className="py-2 font-bold text-white line-clamp-1">{item.name}</td>
                              <td className="py-2 text-cyan-300 font-extrabold">{item.price}</td>
                              <td className="py-2 text-slate-300">{item["Battery Life"] || item["Use Case"]}</td>
                              <td className="py-2 text-amber-400 font-semibold">{item.rating}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Generative UI: Venmo Bill-Split Card */}
                {msg.venmoSplit && (
                  <div className="my-3 bg-gradient-to-br from-sky-950/60 via-slate-900 to-slate-950 border border-sky-500/40 rounded-2xl p-4 text-slate-100 shadow-xl space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="font-extrabold text-xs tracking-wider text-sky-400 uppercase flex items-center">
                        <Users className="w-3.5 h-3.5 mr-1" /> Venmo Social Split ({msg.venmoSplit.splitCount} Payers)
                      </span>
                      <span className="bg-sky-500/20 text-sky-300 text-[10px] font-bold px-2 py-0.5 rounded-md border border-sky-500/30">
                        ${msg.venmoSplit.perPersonAmount.toFixed(2)} / person
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      {msg.venmoSplit.payers.map((payer: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                          <div>
                            <div className="font-bold text-white">{payer.name}</div>
                            <div className="text-[10px] text-sky-400 font-mono">{payer.venmoHandle}</div>
                          </div>
                          <div className="text-right">
                            <span className="font-black text-white">${payer.shareAmount.toFixed(2)}</span>
                            <span className={`block text-[9px] font-bold ${payer.status === "PAID" ? "text-emerald-400" : "text-amber-400"}`}>
                              {payer.status === "PAID" ? "✓ Your Share" : "⚡ Venmo Request Ready"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Total: ${msg.venmoSplit.totalAmount.toFixed(2)}</span>
                      <span className="text-sky-300 font-semibold flex items-center">
                        Venmo 1-Click Deep Links Armed
                      </span>
                    </div>
                  </div>
                )}

                {/* Generative UI: PayPal Xoom FX International Card */}
                {msg.xoomQuote && (
                  <div className="my-3 bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-950 border border-indigo-500/40 rounded-2xl p-4 text-slate-100 shadow-xl space-y-2.5">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="font-extrabold text-xs tracking-wider text-indigo-400 uppercase flex items-center">
                        <Globe className="w-3.5 h-3.5 mr-1" /> PayPal Xoom Cross-Border Quote
                      </span>
                      <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded-md border border-indigo-500/30">
                        {msg.xoomQuote.fxLockDurationMinutes}m FX Lock
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">USD Source Price</span>
                        <span className="font-bold text-white">${msg.xoomQuote.sourceAmountUSD.toFixed(2)}</span>
                      </div>
                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">Target ({msg.xoomQuote.targetCurrency})</span>
                        <span className="font-black text-indigo-300">{msg.xoomQuote.formattedTargetAmount}</span>
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-400 flex justify-between items-center pt-1 border-t border-slate-800">
                      <span>Exchange Rate: 1 USD = {msg.xoomQuote.exchangeRate} {msg.xoomQuote.targetCurrency}</span>
                      <span className="text-emerald-400 font-bold">Transfer Fee: {msg.xoomQuote.xoomTransferFee === 0 ? "FREE" : `$${msg.xoomQuote.xoomTransferFee}`}</span>
                    </div>
                  </div>
                )}

                {/* Generative UI: Budget Progress Meter Widget */}
                {msg.toolInvocations?.some((t) => t.name === "check_budget") && (
                  <div className="my-3 bg-slate-950 rounded-2xl p-3.5 border border-slate-800 space-y-2">
                    {(() => {
                      const b = msg.toolInvocations.find((t) => t.name === "check_budget")?.result;
                      const percent = Math.min(100, Math.round((b.estimatedTotal / b.budget) * 100));
                      return (
                        <>
                          <div className="flex justify-between items-center text-xs font-bold">
                            <span className="text-slate-300 flex items-center">
                              <DollarSign className="w-3.5 h-3.5 text-emerald-400 mr-1" />
                              Budget Analysis
                            </span>
                            <span className={b.isWithinBudget ? "text-emerald-400" : "text-rose-400"}>
                              {b.isWithinBudget ? "✅ Within Budget" : "⚠️ Over Budget"}
                            </span>
                          </div>

                          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                b.isWithinBudget ? "bg-emerald-500" : "bg-rose-500"
                              }`}
                              style={{ width: `${percent}%` }}
                            ></div>
                          </div>

                          <div className="flex justify-between text-[11px] text-slate-400">
                            <span>Cost: ${b.estimatedTotal.toFixed(2)}</span>
                            <span>Target: ${b.budget.toFixed(2)} ({percent}%)</span>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}

                {/* Text Content with Bold Formatting (No stars) */}
                <div className="leading-relaxed">
                  {renderFormattedText(msg.content)}
                </div>

                {/* Generative UI: Interactive Locked Quote Card */}
                {msg.quote && (
                  <div className="mt-4 bg-gradient-to-br from-brand-950 via-slate-900 to-slate-950 border border-brand-500/40 rounded-2xl p-4 text-slate-100 shadow-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-extrabold text-xs tracking-wider text-cyan-400 uppercase flex items-center">
                        <Sparkles className="w-3.5 h-3.5 mr-1" /> Official Order Quote
                      </span>
                      <div className="flex items-center space-x-1.5 bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-md border border-amber-500/30">
                        <Clock className="w-3 h-3 animate-pulse" />
                        <span>Expires in {formatTimer(quoteSecondsLeft)}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs border-y border-slate-800 py-2.5 my-2.5">
                      {msg.quote.items.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between font-medium">
                          <span className="text-slate-300">{item.quantity}x {item.productName}</span>
                          <span className="font-bold text-white">${item.lineTotal.toFixed(2)}</span>
                        </div>
                      ))}

                      {/* PayPal Honey Coupon Savings */}
                      {msg.quote.discountAmount > 0 && (
                        <div className="flex justify-between text-amber-300 font-bold bg-amber-950/40 px-2 py-1 rounded-lg border border-amber-500/30">
                          <span className="flex items-center">
                            🍯 PayPal Honey ({msg.quote.couponCode || "PROMO"})
                          </span>
                          <span>-${msg.quote.discountAmount.toFixed(2)}</span>
                        </div>
                      )}

                      <div className="flex justify-between text-slate-400 pt-1">
                        <span>Tax (8%)</span>
                        <span>${msg.quote.tax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Shipping</span>
                        <span className="text-emerald-400 font-semibold">
                          {msg.quote.shipping === 0 ? "FREE" : `$${msg.quote.shipping.toFixed(2)}`}
                        </span>
                      </div>
                      <div className="flex justify-between font-black text-sm text-white pt-2 border-t border-slate-800">
                        <span>Total Quote Due</span>
                        <span className="text-cyan-400">${msg.quote.total.toFixed(2)}</span>
                      </div>

                      {/* PayPal Ecosystem Telemetry Badges */}
                      <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
                        <div className="bg-slate-950/80 border border-slate-800 p-2 rounded-xl flex items-center space-x-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="text-slate-300">
                            <strong className="text-emerald-400">Simility Risk: {msg.quote.similityRiskScore ?? 6}/100</strong> (Clean)
                          </span>
                        </div>
                        <div className="bg-slate-950/80 border border-slate-800 p-2 rounded-xl flex items-center space-x-1.5">
                          <DollarSign className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <span className="text-slate-300">
                            Pay Later: <strong>4x ${(msg.quote.bnplInstallment || (msg.quote.total / 4)).toFixed(2)}</strong> (0% APR)
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleProceedQuote(msg.quote)}
                      className="w-full mt-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center space-x-2 transition-all shadow-lg shadow-emerald-600/30 active:scale-95"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve Quote & Launch PayPal Sandbox</span>
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                )}

                {/* Suggested Action Chips */}
                {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-wrap gap-1.5">
                    {msg.suggestedActions.map((action, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(action)}
                        className="text-xs bg-slate-800 hover:bg-brand-950 hover:text-cyan-300 hover:border-cyan-500/50 text-slate-300 px-3 py-1 rounded-xl border border-slate-700 transition-all text-left flex items-center"
                      >
                        <Sparkles className="w-3 h-3 mr-1.5 text-amber-400 shrink-0" />
                        <span>{action}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Reasoning Trace Stepper during loading */}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl rounded-bl-none p-4 shadow-xl text-xs space-y-2 max-w-[85%]">
                <div className="flex items-center space-x-2 text-cyan-400 font-bold">
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></div>
                  <span>Agentic Commerce Orchestration Trace...</span>
                </div>
                <div className="space-y-1.5 pt-1">
                  {reasoningSteps.slice(0, loadingStep + 1).map((step, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center space-x-2 font-mono text-[11px] ${
                        idx === loadingStep ? "text-white font-bold" : "text-slate-400"
                      }`}
                    >
                      <span className="text-emerald-400">{idx < loadingStep ? "✓" : "⚡"}</span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Footer / Input */}
        <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center space-x-2">
          {/* Voice Input Button */}
          <button
            onClick={handleToggleVoice}
            className={`p-2.5 rounded-xl border transition-all ${
              isListening
                ? "bg-rose-600 text-white border-rose-500 animate-pulse shadow-lg shadow-rose-600/30"
                : "bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 border-slate-700"
            }`}
            title={isListening ? "Listening... click to stop" : "Speak to PayPilot Copilot"}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            type="text"
            placeholder={isListening ? "Listening to your voice..." : "Ask copilot, split with Venmo, or run agentic checkout..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={loading}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all placeholder-slate-500"
          />

          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-500 hover:to-cyan-500 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-brand-500/20 transition-all cursor-pointer active:scale-95"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
