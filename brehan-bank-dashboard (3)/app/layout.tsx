import "./globals.css"

import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Providers } from "./providers"
import { checkAuthStatus } from "@/lib/api"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Brehan Bank Dashboard",
  description: "Admin Dashboard for Brehan Bank",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Call the checkAuthStatus function on client-side 
  if (typeof window !== 'undefined') {
    // Use setTimeout to ensure it runs after hydration
    setTimeout(() => {
      checkAuthStatus();
    }, 100);
  }

  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
