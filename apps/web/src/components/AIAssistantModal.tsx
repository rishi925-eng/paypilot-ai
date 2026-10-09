"use client";

import React, { useState, useRef, useEffect } from "react";
import { Bot, Send, X, Sparkles, ShoppingBag, ArrowRight, ShieldCheck, CheckCircle2, ChevronRight } from "lucide-react";
import { fetchApi } from "../lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Message {
  role: "user" | "assistant";
  content: string;
  toolInvocations?: Array<{
    name: string;
    input: any;
    result: any;
  }>;
  quote?: any;
  suggestedActions?: string[];
}

export default function AIAssistantModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "👋 Hi! I'm **PayPilot AI**, your intelligent shopping and checkout copilot. Ask me to find developer audio gear, compare tech specs, plan around your budget, or prepare an order quote for PayPal checkout.",
      suggestedActions: [
        "Headphones for coding under $300",
        "Compare Sony WH-1000XM5 vs Bose QC45",
        "Best developer desk setup accessories",
      ],
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

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
        suggestedActions: data.suggestedActions,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "❌ Sorry, I had trouble processing that request. Please verify the backend server is running.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleProceedQuote = async (quote: any) => {
    try {
      // Add items from quote to cart
      for (const item of quote.items) {
        await fetchApi("/api/cart/items", {
          method: "POST",
          body: JSON.stringify({ productId: item.productId, quantity: item.quantity }),
        });
      }
      onClose();
      router.push("/checkout");
    } catch (e: any) {
      alert("Error transferring quote to checkout: " + e.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl h-[650px] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-700 via-brand-600 to-brand-500 p-4 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center border border-white/20">
              <Bot className="w-6 h-6 text-brand-100" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-lg leading-tight">PayPilot AI Assistant</h3>
                <span className="bg-emerald-400/20 text-emerald-300 text-xs px-2 py-0.5 rounded-full font-medium flex items-center border border-emerald-400/30">
                  <ShieldCheck className="w-3 h-3 mr-1" /> LangGraph Guarded
                </span>
              </div>
              <p className="text-xs text-brand-100">Zero-trust pricing & PayPal Sandbox orchestration</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-4 text-sm shadow-sm ${
                  msg.role === "user"
                    ? "bg-brand-600 text-white rounded-br-none"
                    : "bg-white text-slate-800 border border-slate-200/80 rounded-bl-none"
                }`}
              >
                {/* Assistant Tool Invocation Badges */}
                {msg.toolInvocations && msg.toolInvocations.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2.5 pb-2 border-b border-slate-100">
                    {msg.toolInvocations.map((t, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono bg-brand-50 text-brand-700 border border-brand-200"
                      >
                        ⚡ tool: {t.name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Message Content */}
                <div className="whitespace-pre-line leading-relaxed">
                  {msg.content}
                </div>

                {/* Interactive Quote Card */}
                {msg.quote && (
                  <div className="mt-3 bg-gradient-to-br from-brand-50/80 to-blue-50/50 border border-brand-200 rounded-xl p-3.5 text-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-xs tracking-wider text-brand-700 uppercase">
                        Official Order Quote
                      </span>
                      <span className="text-[11px] bg-amber-100 text-amber-800 font-medium px-2 py-0.5 rounded">
                        Requires Approval
                      </span>
                    </div>

                    <div className="space-y-1 text-xs border-y border-brand-100/80 py-2 my-2">
                      {msg.quote.items.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between font-medium">
                          <span>{item.quantity}x {item.productName}</span>
                          <span>${item.lineTotal.toFixed(2)}</span>
                        </div>
                      ))}
                      <div className="flex justify-between text-slate-500 pt-1">
                        <span>Tax (8%)</span>
                        <span>${msg.quote.tax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>Shipping</span>
                        <span>{msg.quote.shipping === 0 ? "FREE" : `$${msg.quote.shipping.toFixed(2)}`}</span>
                      </div>
                      <div className="flex justify-between font-bold text-sm text-brand-900 pt-1 border-t border-brand-200">
                        <span>Total</span>
                        <span>${msg.quote.total.toFixed(2)}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleProceedQuote(msg.quote)}
                      className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs py-2 px-3 rounded-lg flex items-center justify-center space-x-1.5 transition-all shadow-sm shadow-emerald-200"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve Quote & Proceed to PayPal Checkout</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </button>
                  </div>
                )}

                {/* Suggested Action Chips */}
                {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                    {msg.suggestedActions.map((action, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(action)}
                        className="text-xs bg-slate-100 hover:bg-brand-50 hover:text-brand-600 hover:border-brand-200 text-slate-600 px-2.5 py-1 rounded-full border border-slate-200 transition-all text-left flex items-center"
                      >
                        <Sparkles className="w-3 h-3 mr-1 text-amber-500" />
                        {action}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none p-3 shadow-sm flex items-center space-x-2 text-slate-500 text-xs">
                <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></div>
                <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse delay-75"></div>
                <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse delay-150"></div>
                <span className="font-medium text-slate-600">Querying catalogue & checking stock...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="E.g., compare Sony vs Bose headphones, or check budget under $300..."
              className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all text-slate-800"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white p-2.5 rounded-xl transition-all shadow-md shadow-brand-200 flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
