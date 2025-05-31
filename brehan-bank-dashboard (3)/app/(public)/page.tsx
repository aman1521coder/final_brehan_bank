import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Building, Users } from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-128px)]">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-amber-50 to-yellow-100 py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gold-800 mb-6">
            Welcome to Brehan Bank
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            A leading financial institution dedicated to providing excellent services and innovative solutions
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild className="bg-gold-500 hover:bg-gold-600">
              <Link href="/careers">
                View Career Opportunities <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Join Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 border rounded-lg bg-amber-50">
              <div className="w-12 h-12 flex items-center justify-center bg-gold-100 rounded-full mb-4">
                <Building className="h-6 w-6 text-gold-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Work at a Leading Bank</h3>
              <p className="text-muted-foreground mb-4">
                Brehan Bank offers a supportive environment where employees can grow professionally and make meaningful contributions.
              </p>
              <Button asChild variant="outline" className="border-gold-300 text-gold-700">
                <Link href="/careers">
                  Explore Opportunities
                </Link>
              </Button>
            </div>

            <div className="p-6 border rounded-lg bg-amber-50">
              <div className="w-12 h-12 flex items-center justify-center bg-gold-100 rounded-full mb-4">
                <Users className="h-6 w-6 text-gold-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Be Part of Our Community</h3>
              <p className="text-muted-foreground mb-4">
                Join a team of dedicated professionals who are passionate about serving customers and making a difference in the community.
              </p>
              <Button asChild variant="outline" className="border-gold-300 text-gold-700">
                <Link href="/careers">
                  View Career Opportunities
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
} 