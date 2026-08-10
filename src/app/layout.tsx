import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { headers } from "next/headers";
import { Geist, Geist_Mono, Noto_Sans_Devanagari } from "next/font/google";
import { BRAND_NAVY, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import { AppShellInit } from "@/components/AppShellInit";
import "./globals.css";

// job-lagyo-app.vercel.app is the URL the installed Android app loads
// (see capacitor.config.ts). Forcing the native-app chrome (tab bar,
// hidden navbar/footer) whenever this host is hit — not just when
// window.Capacitor reports a native platform — lets anyone preview the
// app's look in an ordinary desktop browser, not only on-device.
const APP_HOSTNAMES = new Set(["job-lagyo-app.vercel.app"]);

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoSansDevanagari = Noto_Sans_Devanagari({
  variable: "--font-devanagari",
  subsets: ["devanagari"],
  weight: ["700", "800", "900"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Nepal's Job Portal`,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "Job Lagyo",
    "jobs in Nepal",
    "Nepal job portal",
    "Kathmandu jobs",
    "vacancy in Nepal",
    "hire in Nepal",
    "job vacancy Kathmandu",
    "रोजगार नेपाल",
  ],
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "employment",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Nepal's Job Portal`,
    description: SITE_DESCRIPTION,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Nepal's Job Portal`,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  manifest: "/manifest.webmanifest",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: SITE_NAME,
  },
};

export const viewport: Viewport = {
  themeColor: BRAND_NAVY,
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/og-logo-mark.png`,
  description: SITE_DESCRIPTION,
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/jobs?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const host = (await headers()).get("host") ?? "";
  const isAppHost = APP_HOSTNAMES.has(host.split(":")[0]);

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${notoSansDevanagari.variable} h-full antialiased${isAppHost ? " capacitor-app" : ""}`}
    >
      <head>
        {/*
          Runs before hydration so browser-only chrome (see .web-chrome in
          globals.css) never flashes on screen inside the native app shell.
        */}
        <Script id="capacitor-detect" strategy="beforeInteractive">
          {`(function(){try{if(window.Capacitor&&window.Capacitor.isNativePlatform&&window.Capacitor.isNativePlatform()){document.documentElement.classList.add('capacitor-app');}}catch(e){}})();`}
        </Script>
      </head>
      <body className="min-h-full">
        <AppShellInit />
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </body>
    </html>
  );
}
