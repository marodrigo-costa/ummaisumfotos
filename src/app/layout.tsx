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
  title: "UmMaisUm Fotos de Família",
  description: "Estúdio fotográfico especializado em eternizar momentos com um olhar artístico e editorial. Casamentos, Gestantes, Newborn e ensaios temáticos.",
  openGraph: {
    title: "UmMaisUm Fotos de Família",
    description: "Estúdio fotográfico especializado em eternizar momentos com um olhar artístico e editorial.",
    images: ["/images/logotipo.png"],
    type: "website",
  },
  icons: {
    icon: "/images/logotipo.png",
    apple: "/images/logotipo.png",
  },
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
