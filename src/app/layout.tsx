import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CampusFlow — Student Productivity & Expense Manager",
  description:
    "Plan tasks, track expenses, manage study goals and notes from a single campus dashboard. Built for students.",
  keywords: [
    "CampusFlow",
    "student productivity",
    "expense tracker",
    "task manager",
    "study planner",
    "notes",
  ],
  authors: [{ name: "CampusFlow" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "CampusFlow",
    description:
      "Student Productivity & Expense Management System — tasks, expenses, study goals & notes.",
    siteName: "CampusFlow",
    type: "website",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider>{children}</ThemeProvider>
        <SonnerToaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
