import type { Metadata } from "next";
import localFont from "next/font/local";
import { PostHogProvider } from "@/components/analytics/PostHogProvider";
import "./globals.css";


// Fonts are self-hosted (from @fontsource, OFL licence) so builds never depend on Google Fonts.
const bricolage = localFont({
  src: [
    { path: "./fonts/bricolage-grotesque-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/bricolage-grotesque-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "./fonts/bricolage-grotesque-latin-800-normal.woff2", weight: "800", style: "normal" },
  ],
  variable: "--font-bricolage",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

const instrument = localFont({
  src: [
    { path: "./fonts/instrument-sans-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/instrument-sans-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "./fonts/instrument-sans-latin-600-normal.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-instrument",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

const ibmPlexMono = localFont({
  src: [
    { path: "./fonts/ibm-plex-mono-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "./fonts/ibm-plex-mono-latin-600-normal.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-plex-mono",
  display: "swap",
  fallback: ["ui-monospace", "monospace"],
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://connect.thefuturecouncil.in";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "TFC Connect — Find your co-founder. Get your startup seen.",
    template: "%s · TFC Connect",
  },
  description:
    "India's free co-founder matching portal and startup directory by The Future Council. Connect with verified student founders across 90+ university chapters.",
  keywords: [
    "co-founder",
    "startup",
    "student founders",
    "India",
    "IIT",
    "DU",
    "NSUT",
    "DTU",
    "SRCC",
    "campus startups",
    "The Future Council",
  ],
  authors: [{ name: "The Future Council", url: "https://thefuturecouncil.in" }],
  creator: "The Future Council",
  publisher: "The Future Council",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: APP_URL,
    siteName: "TFC Connect",
    title: "TFC Connect — Find your co-founder. Get your startup seen.",
    description:
      "India's free co-founder matching portal and startup directory for campus builders. 90+ university chapters across India.",
    images: [
      {
        url: `/og-image.png`,
        width: 1200,
        height: 630,
        alt: "TFC Connect — Co-founder Matching for Campus Founders",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TFC Connect — Find your co-founder",
    description: "Free co-founder matching + startup directory for campus founders in India.",
    images: [`/og-image.png`],
    creator: "@thefuturecouncil",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/logo.png", type: "image/png" },
    ],
    apple: "/logo.png",
  },
  manifest: undefined,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: APP_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${instrument.variable} ${ibmPlexMono.variable}`}
    >
      <body className="min-h-screen bg-warm text-ink antialiased">
        <PostHogProvider>{children}</PostHogProvider>
      </body>
    </html>
  );
}
