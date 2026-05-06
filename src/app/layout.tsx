import type { Metadata, Viewport } from "next";
import { Noto_Serif, Manrope, Great_Vibes } from "next/font/google";
import "./globals.css";

const notoSerif = Noto_Serif({
  variable: "--font-noto-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const scriptFont = Great_Vibes({
  variable: "--font-script",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "Um Mais Um Fotos | Fotografia Premium em Ourinhos-SP",
  description: "Estúdio fotográfico especializado em eternizar momentos com um olhar artístico e editorial. Casamentos, Gestantes, Newborn e ensaios temáticos.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

import { NavBar } from "@/components/layout/NavBar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${notoSerif.variable} ${manrope.variable} ${scriptFont.variable} antialiased`}
    >
      <body className="min-h-screen bg-background font-sans">
        <NavBar />
        {children}
      </body>
    </html>
  );
}
