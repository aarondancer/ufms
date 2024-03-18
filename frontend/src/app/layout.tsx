import { Dynamic } from "@/components/Dynamic";
import { cn } from "@/utils";
import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import "./globals.css";

export const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "UFMS",
  description: "Aaron Dancer - D424 Capstone Project",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  "use client";
  return (
    <html lang="en">
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <Dynamic>{children}</Dynamic>
      </body>
    </html>
  );
}
