import "./globals.css";
import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";

import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/providers/theme";
import ModalProvider from "@/components/providers/modal-provider";

import { cn } from "@/lib/utils";
import { BroadcastProvider } from "@/components/providers/broadcast-provider";
import { QueryProvider } from "@/components/providers/query-provider";

const font = Open_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Harmony",
  description: "Team chat app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={cn(font.className, "bg-white dark:bg-[#313338]")}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            storageKey="harmony-theme"
          >
            <BroadcastProvider>
              <QueryProvider>
                <ModalProvider />
                {children}
              </QueryProvider>
            </BroadcastProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
