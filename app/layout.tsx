import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import Providers from "@/lib/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FlowDocs",
  description: "Documents, reimagined",

  icons: {
    icon: "/favicon.svg",
  },

  openGraph: {
    title: "FlowDocs",
    description: "Documents, reimagined",
    images: ["/og.png"],
  },

  twitter: {
    card: "summary_large_image",
    title: "FlowDocs",
    description: "Documents, reimagined",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <Providers>
          <main>{children}</main>
          <SpeedInsights />
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
