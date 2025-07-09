"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Database, CheckCircle, XCircle } from "lucide-react"

export default function SeedPage() {
  const [isSeeding, setIsSeeding] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSeed = async () => {
    setIsSeeding(true)
    setResult(null)
    setError(null)

    try {
      const response = await fetch("/api/seed", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (data.success) {
        setResult(data)
      } else {
        setError(data.error || "Failed to seed database")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error occurred")
    } finally {
      setIsSeeding(false)
    }
  }

  return (
    <div className="container py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Seeder
          </CardTitle>
          <CardDescription>Populate your MongoDB database with sample authors and books data.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleSeed} disabled={isSeeding} className="w-full">
            {isSeeding ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Seeding Database...
              </>
            ) : (
              <>
                <Database className="mr-2 h-4 w-4" />
                Seed Database
              </>
            )}
          </Button>

          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Error:</strong> {error}
              </AlertDescription>
            </Alert>
          )}

          {result && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Success!</strong> {result.message}
                <div className="mt-2 space-y-1 text-sm">
                  <div>📖 Authors created: {result.data.authorsCreated}</div>
                  <div>📚 Books created: {result.data.booksCreated}</div>
                  <div>🏷️ Genres: {result.data.genres.join(", ")}</div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {result && result.data && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Authors Created:</h3>
                <div className="grid grid-cols-1 gap-2">
                  {result.data.authors.map((author: any, index: number) => (
                    <div key={index} className="text-sm bg-muted p-2 rounded">
                      {author.name} ({author.nationality})
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Books Created:</h3>
                <div className="grid grid-cols-1 gap-2">
                  {result.data.books.map((book: any, index: number) => (
                    <div key={index} className="text-sm bg-muted p-2 rounded">
                      {book.title} ({book.genre}, {book.year})
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
