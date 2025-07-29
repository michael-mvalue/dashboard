import "@/lib/styles/globals.css";
import { Metadata, Viewport } from "next";
import clsx from "clsx";

import Navbar from "@/lib/layouts/Navbar";
import { fontSans, siteConfig } from "@/lib/config";
import { Providers } from "@/lib/layouts/providers";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="en">
      <head />
      <body
        className={clsx(
          "min-h-screen text-foreground font-sans antialiased dark:bg-[#313335]",
          fontSans.variable,
        )}
      >
        <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
          <div className="relative flex flex-col h-screen ">
            <Navbar />
            <main className="container mx-auto max-w-9xl px-6 flex-grow ">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
