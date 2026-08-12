import type { Metadata, Viewport } from "next";
import { Pixelify_Sans, Press_Start_2P } from "next/font/google";
import "./globals.css";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { RegisterSW } from "@/components/pwa/register-sw";

const pixel = Pixelify_Sans({
  variable: "--font-pixel",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const press = Press_Start_2P({
  variable: "--font-press",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CampusFlow — Pixel Edition",
  description:
    "A calm, pixel-art student productivity & expense manager. Tasks, expenses, study goals and notes — all in a mindful Pixelscape.",
  manifest: "/manifest.json",
  applicationName: "CampusFlow",
  keywords: [
    "CampusFlow",
    "pixelscape",
    "pixel",
    "student productivity",
    "expense tracker",
    "task manager",
    "study planner",
    "notes",
  ],
  authors: [{ name: "CampusFlow" }],
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/icon-192.png", sizes: "192x192" }],
  },
  appleWebApp: {
    capable: true,
    title: "CampusFlow",
    statusBarStyle: "default",
  },
  openGraph: {
    title: "CampusFlow — Pixel Edition",
    description:
      "A calm, pixel-art student productivity & expense manager. Mindful to use.",
    siteName: "CampusFlow",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#3a9d6f",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${pixel.variable} ${press.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider>
          <div className="pixelscape">{children}</div>
        </ThemeProvider>
        <RegisterSW />
        <SonnerToaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
