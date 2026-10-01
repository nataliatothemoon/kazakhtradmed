import type { Metadata } from "next";
import { Fraunces, Geist, Noto_Sans_SC } from "next/font/google";
import { SiteFooter, SiteHeader } from "@/components/site/header";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const noto = Noto_Sans_SC({
  variable: "--font-cjk",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Dala dári — Kazakh traditional medicine catalog",
    template: "%s · Dala dári",
  },
  description:
    "A cited ethnobotany catalog and educational skin-symptom lookup built from published papers on Kazakh and Central Asian medicinal plants.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${noto.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <SiteHeader />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
