import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AuthModal from "../components/AuthModal";
import { AuthProvider } from "../lib/auth";
import { CurrencyProvider } from "../lib/currency";
import { ToastProvider } from "../lib/toast";
import { WishlistProvider } from "../lib/wishlist";

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Metadata & SEO                                                              */
/* ─────────────────────────────────────────────────────────────────────────── */
export const metadata: Metadata = {
  title: {
    default: "PayPilot AI — AI-Powered Enterprise Commerce & Secure Payments",
    template: "%s | PayPilot AI",
  },
  description:
    "Enterprise commerce platform with intelligent shopping assistant, verified pricing, real-time inventory, and multi-channel payment solutions.",
  keywords: [
    "AI commerce",
    "Smart Shopping",
    "Secure Payments",
    "Venmo",
    "Digital Wallet",
    "Online Store",
    "Verified Checkout",
  ],
  authors: [{ name: "PayPilot AI Team" }],
  creator: "PayPilot AI",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://paypilot.io",
    siteName: "PayPilot AI",
    title: "PayPilot AI — AI-Powered Commerce & PayPal Sandbox Engine",
    description:
      "Enterprise commerce with autonomous AI copilot, zero-trust pricing, and full PayPal ecosystem integration.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PayPilot AI Commerce Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PayPilot AI — AI Commerce Platform",
    description: "Autonomous AI Copilot + PayPal Sandbox + Zero-Trust Pricing.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#020617",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Root Layout                                                                 */
/* ─────────────────────────────────────────────────────────────────────────── */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Preconnect to image CDNs for performance */}
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
      </head>
      <body className="flex flex-col min-h-screen antialiased bg-slate-950 text-slate-100">
        <ToastProvider>
          <AuthProvider>
            <CurrencyProvider>
              <WishlistProvider>
                {/* Skip to main content for a11y */}
                <a
                  href="#main-content"
                  className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-brand-600 focus:text-white focus:rounded-lg focus:text-sm focus:font-bold"
                >
                  Skip to main content
                </a>

                <Navbar />

                <main id="main-content" className="flex-1">
                  {children}
                </main>

                <Footer />
                <AuthModal />
              </WishlistProvider>
            </CurrencyProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
