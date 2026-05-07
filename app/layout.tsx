import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const plexSans = IBM_Plex_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-plex-sans",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-plex-mono",
});

export const metadata: Metadata = {
  title: "VulnRadar EU — Gestión de vulnerabilidades NIS2",
  description:
    "Plataforma europea de gestión de vulnerabilidades y cumplimiento NIS2 para PyMEs.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${plexSans.variable} ${plexMono.variable}`}>
      <body className="font-sans bg-bg text-text antialiased">{children}</body>
    </html>
  );
}
