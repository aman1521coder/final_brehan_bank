import { PublicNavbar } from "@/components/public/public-navbar"

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicNavbar />
      <main className="flex-1">
        {children}
      </main>
      <footer className="border-t py-6 bg-gold-50">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Brehan Bank. All rights reserved.
        </div>
      </footer>
    </div>
  )
} 