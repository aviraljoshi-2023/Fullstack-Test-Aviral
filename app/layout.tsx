import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ApolloProvider } from "@/lib/apollo-provider"
import Link from "next/link"
import { BookOpen } from "lucide-react"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Library Management System",
  description: "A modern library management system using GraphQL and Next.js.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ApolloProvider>
          <div className="flex min-h-screen flex-col bg-gray-50">
            <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm">
              <div className="container mx-auto flex h-16 items-center px-6 max-w-7xl">
                <Link
                  href="/"
                  className="flex items-center gap-3 font-bold text-xl text-gray-900 hover:text-blue-600 transition-colors"
                >
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                  </div>
                  <span>Library Management System</span>
                </Link>
              </div>
            </header>
            <main className="flex-1">{children}</main>
            <footer className="border-t bg-white py-8">
              <div className="container mx-auto text-center text-sm text-gray-600 px-6 max-w-7xl">
                &copy; {new Date().getFullYear()} Library Management System. All rights reserved.
              </div>
            </footer>
          </div>
        </ApolloProvider>
      </body>
    </html>
  )
}
