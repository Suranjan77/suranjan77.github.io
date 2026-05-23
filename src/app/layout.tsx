import type { Metadata, Viewport } from "next";
import { DM_Mono, Outfit, Shippori_Mincho } from "next/font/google";
import "./globals.css";
import "katex/dist/katex.min.css";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { getAbsoluteUrl, siteConfig } from "@/lib/site";

const shippori = Shippori_Mincho({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-shippori",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-dm-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(getAbsoluteUrl()),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: [...siteConfig.keywords],
  authors: [{ name: "The Digital Observatory" }],
  creator: "The Digital Observatory",
  publisher: "The Digital Observatory",
  category: "education",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: getAbsoluteUrl(),
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#F5F2EC",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light scroll-smooth">
      <body
        className={`${shippori.variable} ${outfit.variable} ${dmMono.variable} min-h-screen bg-background font-body text-on-surface antialiased`}
      >
        <div className="min-h-screen lg:flex">
          <Sidebar />
          <div className="flex min-h-screen min-w-0 flex-1 flex-col lg:ml-[278px]">
            <div className="mx-auto flex min-h-screen w-full max-w-[1500px] min-w-0 flex-1 flex-col border-x border-outline bg-background">
              <Header />
              <main className="min-w-0 flex-1">{children}</main>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
