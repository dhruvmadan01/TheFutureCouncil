import type { Metadata } from "next";
import { Bricolage_Grotesque, Instrument_Sans, IBM_Plex_Mono } from "next/font/google";
import { PostHogProvider } from "@/components/analytics/PostHogProvider";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "600", "800"],
  variable: "--font-bricolage",
  display: "swap",
});

const instrument = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-instrument",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-plex-mono",
  display: "swap",
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
