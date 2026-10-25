import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import { ProfileFooter } from "./components/profile-footer";
import { FooterSkeleton } from "./components/skeletons";
import { TabNav, TabNavBase } from "./components/tab-nav";
import { ThemeToggle, themeScript } from "./components/theme-toggle";
import { Logo } from "./components/ui";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "MyHealth", template: "%s · MyHealth" },
  description: "Personal workout and food plan with daily tracking.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-theme="dark"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* Sets the saved or system theme before the first paint */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-full flex-col text-zinc-900 dark:text-zinc-100">
        <header className="sticky top-0 z-10 border-b border-black/5 bg-zinc-50/90 backdrop-blur dark:border-white/10 dark:bg-black/80">
          {/* Phones: logo + theme switch on top, tabs on a full-width row below.
              Wider screens: logo, then tabs and theme switch on the right. */}
          <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center gap-3 px-4 py-3 sm:flex-nowrap sm:px-6">
            <Logo />
            <div className="order-last w-full sm:order-none sm:ml-auto sm:w-auto">
              <Suspense fallback={<TabNavBase />}>
                <TabNav />
              </Suspense>
            </div>
            <div className="ml-auto sm:ml-0">
              <ThemeToggle />
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6">{children}</main>

        <footer className="mt-auto px-4 pb-6 text-center">
          <div className="mx-auto mb-6 h-0.5 w-full max-w-5xl rounded-full bg-linear-to-r from-transparent via-emerald-400 to-transparent" />
          <Suspense fallback={<FooterSkeleton />}>
            <ProfileFooter />
          </Suspense>
        </footer>
      </body>
    </html>
  );
}
