import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Edger | On-Demand Lawncare",
  description: "Get your lawn looking perfect with Edger. The Uber for lawncare. Book vetted pros instantly.",
  openGraph: {
    title: "Edger | On-Demand Lawncare",
    description: "Get your lawn looking perfect with Edger. The Uber for lawncare. Book vetted pros instantly.",
    type: "website",
    url: "https://edger.app",
    siteName: "Edger",
  },
  twitter: {
    card: "summary_large_image",
    title: "Edger | On-Demand Lawncare",
    description: "Get your lawn looking perfect with Edger. The Uber for lawncare.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased bg-background text-foreground font-sans`}
      >
        {children}
      </body>
    </html>
  );
}
