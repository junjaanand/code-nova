import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { PersonaProvider } from "@/lib/personaContext";

export const metadata: Metadata = {
  title: "BrandShield AI — Intelligent Brand Governance",
  description: "Pre-publication content review against approved guidelines, facts, and assets. CodeNova India 2026.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased flex min-h-screen bg-slate-50 dark:bg-slate-950">
        <PersonaProvider>
          <Sidebar />
          <main className="flex-1 ml-64 min-h-screen flex flex-col">
            {children}
          </main>
        </PersonaProvider>
      </body>
    </html>
  );
}
