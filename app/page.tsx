"use client"

import { useMemo } from "react"
import { useSuspenseQuery, gql } from "@apollo/client"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Eye, BookOpen, User, Calendar } from "lucide-react"

const GET_BOOKS_AND_GENRES = gql`
  query GetBooksAndGenres {
    getAllBooks {
      id
      title
      author {
        id
        name
      }
      genre
      publicationYear
    }
    getAllGenres
  }
`

export default function HomePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedGenre = searchParams.get("genre") || "all"

  const { data } = useSuspenseQuery(GET_BOOKS_AND_GENRES)
  const { getAllBooks: books, getAllGenres: genres } = data

  const filteredBooks = useMemo(() => {
    if (selectedGenre === "all") {
      return books
    }
    return books.filter((book: any) => book.genre === selectedGenre)
  }, [books, selectedGenre])

  const handleGenreChange = (genre: string) => {
    const params = new URLSearchParams(window.location.search)
    if (genre === "all") {
      params.delete("genre")
    } else {
      params.set("genre", genre)
    }
    router.push(`?${params.toString()}`)
  }

  const handleViewBook = (bookId: string) => {
    router.push(`/book/${bookId}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Books Catalog</h1>
              <p className="text-lg text-gray-600">Discover and manage your library collection</p>
            </div>
            <Link href="/book/add">
              <Button size="lg" className="w-full lg:w-auto bg-blue-600 hover:bg-blue-700 shadow-lg">
                <Plus className="mr-2 h-5 w-5" />
                Add New Book
              </Button>
            </Link>
          </div>
        </div>

        {/* Filter Section */}
        <div className="mb-8">
          <Card className="shadow-sm border-0 bg-white/70 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <label htmlFor="genre-filter" className="text-sm font-semibold text-gray-700 whitespace-nowrap">
                  Filter by Genre:
                </label>
                <Select value={selectedGenre} onValueChange={handleGenreChange}>
                  <SelectTrigger className="w-full sm:w-[250px] bg-white">
                    <SelectValue placeholder="All Genres" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Genres</SelectItem>
                    {genres.map((genre: string) => (
                      <SelectItem key={genre} value={genre}>
                        {genre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="text-sm text-gray-500">
                  Showing {filteredBooks.length} of {books.length} books
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Books Grid */}
        {filteredBooks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBooks.map((book: any) => (
              <Card
                key={book.id}
                className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur overflow-hidden"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant="secondary" className="text-xs px-2 py-1 bg-blue-100 text-blue-700 border-blue-200">
                      {book.genre}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewBook(book.id)}
                      className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-50 hover:text-blue-600"
                    >
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">View details for {book.title}</span>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    {/* Book Icon */}
                    <div className="flex justify-center">
                      <div className="p-4 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl">
                        <BookOpen className="h-12 w-12 text-blue-600" />
                      </div>
                    </div>

                    {/* Book Info */}
                    <div className="text-center space-y-2">
                      <CardTitle className="text-lg font-bold text-gray-900 line-clamp-2 leading-tight">
                        {book.title}
                      </CardTitle>
                      <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
                        <User className="h-4 w-4" />
                        <span>{book.author.name}</span>
                      </div>
                      <div className="flex items-center justify-center gap-1 text-sm text-gray-500">
                        <Calendar className="h-4 w-4" />
                        <span>{book.publicationYear}</span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <Button
                      variant="outline"
                      onClick={() => handleViewBook(book.id)}
                      className="w-full bg-transparent hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-colors"
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="shadow-sm border-0 bg-white/70 backdrop-blur">
            <CardContent className="py-16">
              <div className="text-center space-y-4">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
                  <BookOpen className="h-12 w-12 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No books found</h3>
                  <p className="text-gray-600 mb-6">
                    {selectedGenre === "all"
                      ? "Your library is empty. Add your first book to get started!"
                      : `No books found in the "${selectedGenre}" genre.`}
                  </p>
                  <Link href="/book/add">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Your First Book
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
