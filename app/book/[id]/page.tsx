"use client"

import { useQuery, gql } from "@apollo/client"
import { notFound, useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, BookOpen, Calendar, User, Hash, Globe, Edit, Loader2 } from "lucide-react"

const GET_BOOK_DETAILS = gql`
  query GetBookDetails($id: ID!) {
    getBookDetails(id: $id) {
      id
      title
      genre
      publicationYear
      isbn
      author {
        id
        name
        nationality
        birthYear
      }
    }
  }
`

export default function BookDetailPage() {
  const params = useParams()
  const bookId = params.id as string

  const { data, loading, error } = useQuery(GET_BOOK_DETAILS, {
    variables: { id: bookId },
    errorPolicy: "all",
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-6 py-8 max-w-6xl">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
              <p className="text-lg text-gray-600">Loading book details...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    console.error("Error loading book:", error)
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-6 py-8 max-w-6xl">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-8 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Catalog
          </Link>
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
            <CardContent className="p-8 text-center">
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <BookOpen className="h-8 w-8 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Book Not Found</h2>
                <p className="text-gray-600">The book you're looking for doesn't exist or has been removed.</p>
                <Link href="/">
                  <Button className="bg-blue-600 hover:bg-blue-700">Return to Catalog</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const book = data?.getBookDetails

  if (!book) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Catalog
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Book Details */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="space-y-2">
                    <CardTitle className="text-3xl font-bold text-gray-900">{book.title}</CardTitle>
                    <p className="text-lg text-gray-600">by {book.author.name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200 px-3 py-1">{book.genre}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-xl">
                      <BookOpen className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Genre</p>
                      <p className="text-xl font-semibold text-gray-900">{book.genre}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-100 rounded-xl">
                      <Calendar className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Published</p>
                      <p className="text-xl font-semibold text-gray-900">{book.publicationYear}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:col-span-2">
                    <div className="p-3 bg-purple-100 rounded-xl">
                      <Hash className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">ISBN</p>
                      <p className="text-xl font-semibold text-gray-900 font-mono">{book.isbn}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t">
                  <Link href={`/book/${book.id}/edit`}>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Book
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Author Details */}
          <div>
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 border-b">
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  About the Author
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-100 rounded-xl">
                    <User className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Name</p>
                    <p className="text-lg font-semibold text-gray-900">{book.author.name}</p>
                  </div>
                </div>

                {book.author.nationality && (
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-red-100 rounded-xl">
                      <Globe className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Nationality</p>
                      <p className="text-lg font-semibold text-gray-900">{book.author.nationality}</p>
                    </div>
                  </div>
                )}

                {book.author.birthYear && (
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-teal-100 rounded-xl">
                      <Calendar className="h-6 w-6 text-teal-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Born</p>
                      <p className="text-lg font-semibold text-gray-900">{book.author.birthYear}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
