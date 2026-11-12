"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Bot,
  Send,
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
  ArrowLeft,
  RefreshCw,
  Lock,
} from "lucide-react";
import { fetchApi } from "../../lib/api";
import { useCurrency } from "../../lib/currency";
import { useToast } from "../../lib/toast";

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
          } else {
            elements.push(matchedStr);
          }

          remaining = remaining.substring(match.index + matchedStr.length);
        }

        if (line.trim().startsWith("• ") || line.trim().startsWith("- ")) {
          return (
            <div key={lineIdx} className="flex items-start space-x-2 pl-2">
              <span className="text-cyan-400 mt-0.5 font-bold">•</span>
              <span className="flex-1">{elements}</span>
            </div>
          );
        }

        return <p key={lineIdx}>{elements}</p>;
      })}
    </div>
  );
}

function CopilotChat() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const { formatPrice } = useCurrency();
  const { toast } = useToast();

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
  const [isListening, setIsListening] = useState(false);
  const [voiceOutputEnabled, setVoiceOutputEnabled] = useState(false);
  const [quoteSecondsLeft, setQuoteSecondsLeft] = useState(900);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const executedInitialQuery = useRef(false);

  const reasoningSteps = [
    "🧠 Analyzing intent & technical hardware specifications...",
    "🏬 Querying PayPal Zettle POS omnichannel stock ledger...",
    "🍯 Scanning PayPal Honey promo registry for maximal savings...",
    "🛡️ Evaluating PayPal Simility AI fraud & anomaly heuristics...",
    "🔒 Generating zero-trust cryptographic order quote...",
  ];

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

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
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
    if (initialQuery && !executedInitialQuery.current) {
      executedInitialQuery.current = true;
      handleSend(initialQuery);
    }
  }, [initialQuery]);

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
      router.push("/checkout");
    } catch (e: any) {
      alert("Error transferring quote: " + e.message);
    }
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl">
        <div className="flex items-center space-x-3.5">
          <Link
            href="/"
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-2xl transition-all"
            title="Back to Storefront"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 via-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-black text-lg sm:text-xl text-white">PayPilot Agentic Copilot Pro</h1>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center">
                <ShieldCheck className="w-3 h-3 mr-1" /> PayPal Suite Armed
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Honey • Simility • Zettle • Venmo • Paidy BNPL • Xoom FX
            </p>
          </div>
        </div>

        {/* Audio Output Toggle */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              const nextState = !voiceOutputEnabled;
              setVoiceOutputEnabled(nextState);
              if (!nextState && typeof window !== "undefined") {
                window.speechSynthesis?.cancel();
              }
              toast(nextState ? "AI Voice Audio Response Enabled" : "AI Voice Audio Muted", "info");
            }}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
              voiceOutputEnabled
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                : "bg-slate-800 text-slate-400 hover:text-white border border-slate-700/60"
            }`}
          >
            {voiceOutputEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4" />}
            <span>{voiceOutputEnabled ? "Voice Audio On" : "Voice Audio Off"}</span>
          </button>
        </div>
      </div>

      {/* Main Conversation Container */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl flex flex-col h-[700px] overflow-hidden">
        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-3xl p-5 text-xs sm:text-sm shadow-md transition-all ${
                  msg.role === "user"
                    ? "bg-gradient-to-r from-brand-600 via-indigo-600 to-cyan-600 text-white rounded-br-none"
                    : "bg-slate-950/90 text-slate-200 border border-slate-800 rounded-bl-none"
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

                {/* Generative UI: Comparison Table */}
                {msg.toolInvocations?.some((t) => t.name === "compare_products" && t.result?.comparison) && (
                  <div className="my-3 bg-slate-900 rounded-2xl p-4 border border-slate-800 overflow-x-auto">
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
                      <tbody className="divide-y divide-slate-800/60">
                        {msg.toolInvocations
                          .find((t) => t.name === "compare_products")
                          ?.result.comparison.map((item: any, idx: number) => (
                            <tr key={idx} className="hover:bg-slate-800/40">
                              <td className="py-2 font-bold text-white">{item.name}</td>
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

                {/* Generative UI: Xoom Multi-Currency FX Card */}
                {msg.xoomQuote && (
                  <div className="my-3 bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-950 border border-indigo-500/40 rounded-2xl p-4 text-slate-100 shadow-xl space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="font-extrabold text-xs tracking-wider text-indigo-400 uppercase flex items-center">
                        <Globe className="w-3.5 h-3.5 mr-1" /> PayPal Xoom Cross-Border FX
                      </span>
                      <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded-md border border-indigo-500/30">
                        Guaranteed Rate Lock
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-400 block font-semibold">USD Base Price</span>
                        <span className="text-base font-black text-white">${msg.xoomQuote.usdAmount.toFixed(2)}</span>
                      </div>
                      <div className="p-3 bg-slate-950 rounded-xl border border-indigo-500/30">
                        <span className="text-[10px] text-indigo-300 block font-semibold">Target ({msg.xoomQuote.targetCurrency})</span>
                        <span className="text-base font-black text-indigo-300">
                          {msg.xoomQuote.targetCurrency} {msg.xoomQuote.convertedAmount.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-400 flex justify-between items-center pt-1 border-t border-slate-800">
                      <span>Rate: 1 USD = {msg.xoomQuote.exchangeRate.toFixed(4)} {msg.xoomQuote.targetCurrency}</span>
                      <span className="text-emerald-400 font-bold">Xoom Fee: ${msg.xoomQuote.fee.toFixed(2)} (Waived)</span>
                    </div>
                  </div>
                )}

                {/* Generative UI: Cryptographic Order Quote Card */}
                {msg.quote && (
                  <div className="my-3 bg-gradient-to-br from-brand-950/80 via-slate-900 to-slate-950 border border-brand-500/40 rounded-2xl p-4 text-slate-100 shadow-xl space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center space-x-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span className="font-extrabold text-xs tracking-wider text-white uppercase">
                          Zero-Trust Authoritative Order Quote
                        </span>
                      </div>
                      <div className="flex items-center space-x-1.5 text-[11px] font-mono text-amber-300 bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                        <Clock className="w-3 h-3" />
                        <span>Locked: {formatTimer(quoteSecondsLeft)}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      {msg.quote.items.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center py-1">
                          <span className="text-slate-300 font-medium">
                            {item.quantity}x {item.name}
                          </span>
                          <span className="font-bold text-white">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}

                      {msg.quote.honeyDiscount > 0 && (
                        <div className="flex justify-between items-center py-1 text-emerald-400">
                          <span className="flex items-center">
                            <Tag className="w-3 h-3 mr-1" />
                            PayPal Honey Promo ({msg.quote.couponCode || "HONEY20"})
                          </span>
                          <span className="font-bold">-${msg.quote.honeyDiscount.toFixed(2)}</span>
                        </div>
                      )}

                      <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-sm font-black">
                        <span className="text-white">Authoritative Total:</span>
                        <span className="text-emerald-400">${msg.quote.total.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                      <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 flex items-center justify-between">
                        <span className="text-slate-400">Simility Risk Score:</span>
                        <span className="font-bold text-emerald-400">5 / 100 (Safe)</span>
                      </div>
                      <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 flex items-center justify-between">
                        <span className="text-slate-400">Zettle Inventory:</span>
                        <span className="font-bold text-cyan-400">Verified POS</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleProceedQuote(msg.quote)}
                      className="w-full mt-2 py-3 bg-gradient-to-r from-emerald-500 via-teal-500 to-brand-500 hover:from-emerald-400 hover:to-brand-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer active:scale-95"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Transfer Quote &amp; Checkout with PayPal Sandbox</span>
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                )}

                {/* Text Content */}
                <div className="mt-1 leading-relaxed">
                  {renderFormattedText(msg.content)}
                </div>

                {/* Suggested Action Pills */}
                {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                  <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex flex-wrap gap-1.5">
                    {msg.suggestedActions.map((action, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(action)}
                        className="bg-slate-950 hover:bg-slate-800 text-cyan-300 border border-slate-700/80 hover:border-cyan-500/50 text-[11px] font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center space-x-1"
                      >
                        <span>{action}</span>
                        <ChevronRight className="w-3 h-3 text-cyan-400" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Reasoning / Loading State */}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 space-y-2 max-w-[80%]">
                <div className="flex items-center space-x-2 text-cyan-400 font-bold text-xs">
                  <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                  <span>Autonomous Multi-Tool Orchestration in Progress...</span>
                </div>
                <div className="space-y-1.5 pt-1">
                  {reasoningSteps.map((step, idx) => (
                    <div
                      key={idx}
                      className={`text-[11px] flex items-center space-x-2 transition-all ${
                        idx < loadingStep
                          ? "text-emerald-400 font-semibold"
                          : idx === loadingStep
                          ? "text-cyan-300 font-bold animate-pulse"
                          : "text-slate-600"
                      }`}
                    >
                      <span>{idx < loadingStep ? "✓" : idx === loadingStep ? "▶" : "○"}</span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-slate-950 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center space-x-2"
          >
            <button
              type="button"
              onClick={handleToggleVoice}
              className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                isListening
                  ? "bg-rose-500/20 border-rose-500/50 text-rose-400 animate-pulse"
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
              }`}
              title={isListening ? "Listening... click to stop" : "Speak request with microphone"}
            >
              {isListening ? <Mic className="w-5 h-5 text-rose-400" /> : <MicOff className="w-5 h-5" />}
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything: discounts, product comparisons, bill split, or checkouts..."
              className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            />

            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-gradient-to-r from-brand-600 via-indigo-600 to-cyan-600 hover:from-brand-500 hover:to-cyan-500 disabled:opacity-40 text-white p-3 rounded-2xl transition-all shadow-md cursor-pointer disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function CopilotPage() {
  return (
    <Suspense
      fallback={
        <div className="p-16 text-center text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-cyan-400 mb-3" />
          <p className="text-xs font-semibold">Loading PayPilot Copilot Engine...</p>
        </div>
      }
    >
      <CopilotChat />
    </Suspense>
  );
}
