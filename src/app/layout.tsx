import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { getSession } from "next-auth/react";
import "./globals.css";
import Navbar from "@/components/Navbar";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";
import { RetroProvider } from "@/contexts/RetroContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Next Retro",
  description: "",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <SessionProviderWrapper session={session}>
          {/* TODO fetch / ws init retros */}
          <RetroProvider initialRetros={[]}>
            <Navbar />
            {children}
          </RetroProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
