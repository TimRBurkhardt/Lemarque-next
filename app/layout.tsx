import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/providers/theme-provider";
import { BRAND_OG_TITLE, BRAND_TAGLINE } from "@/lib/brand";
import { SITE_URL } from "@/lib/sharing";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#000000",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "LEMARQUE",
    template: "%s | LEMARQUE",
  },
  description:
    `LEMARQUE. ${BRAND_TAGLINE}. Handcrafted leather goods, avant-garde outerwear, and unique accessories.`,
  keywords: [
    "LEMARQUE",
    "fashion",
    "manufactured attire",
    "handmade",
    "leather goods",
    "luxury",
    "collections",
    "designer",
    "avant-garde",
  ],
  authors: [{ name: "LEMARQUE" }],
  creator: "LEMARQUE",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "LEMARQUE",
    title: BRAND_OG_TITLE,
    description:
      "Handcrafted leather goods, avant-garde outerwear, and unique accessories. Every piece manufactured as a unique creation.",
  },
  twitter: {
    card: "summary_large_image",
    title: BRAND_OG_TITLE,
    description:
      "Handcrafted leather goods, avant-garde outerwear, and unique accessories. Every piece manufactured as a unique creation.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
