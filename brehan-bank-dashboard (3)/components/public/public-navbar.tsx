"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"

export function PublicNavbar() {
  const pathname = usePathname()
  
  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-gold-600">Brehan Bank</span>
            </Link>
            <nav className="hidden md:flex gap-6">
              <Link 
                href="/" 
                className={`text-sm font-medium transition-colors hover:text-gold-600 ${
                  pathname === "/" ? "text-gold-600" : "text-gray-600"
                }`}
              >
                Home
              </Link>
              <Link 
                href="/careers" 
                className={`text-sm font-medium transition-colors hover:text-gold-600 ${
                  pathname === "/careers" ? "text-gold-600" : "text-gray-600"
                }`}
              >
                Careers
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Button asChild variant="outline" size="sm">
              <Link href="/admin">Employee Portal</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
} 