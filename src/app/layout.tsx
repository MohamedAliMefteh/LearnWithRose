import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ReactQueryProvider } from "@/components/providers/react-query-provider";
import { AuthProvider } from "@/components/providers/auth-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Learn Arabic with Rose - Master Palestinian & Jordanian Accents",
  description: "Learn authentic Palestinian and Jordanian Arabic accents from a native speaker with 8+ years of teaching experience. Personalized courses and cultural immersion.",
  keywords: ["Arabic", "Palestinian", "Jordanian", "accent", "language learning", "cultural immersion"],
  authors: [{ name: "Rose" }],
  openGraph: {
    title: "Learn Arabic with Rose",
    description: "Master authentic Palestinian & Jordanian Arabic accents",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <ReactQueryProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              {children}
            </TooltipProvider>
          </ReactQueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
