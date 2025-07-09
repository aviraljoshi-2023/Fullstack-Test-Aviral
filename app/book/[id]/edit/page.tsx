"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { gql, useQuery, useMutation } from "@apollo/client"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, BookOpen, CheckCircle, Loader2 } from "lucide-react"

const GET_BOOK_FOR_EDIT = gql`
  query GetBookForEdit($id: ID!) {
    getBookDetails(id: $id) {
      id
      title
      genre
      publicationYear
      isbn
      author {
        id
        name
      }
    }
  }
`

const GET_AUTHORS_AND_GENRES = gql`
  query GetAuthorsAndGenres {
    getAllAuthors {
      id
      name
    }
    getAllGenres
  }
`

const UPDATE_BOOK = gql`
  mutation UpdateBook($id: ID!, $title: String, $authorId: ID, $genre: String, $publicationYear: Int, $isbn: String) {
    updateBook(id: $id, title: $title, authorId: $authorId, genre: $genre, publicationYear: $publicationYear, isbn: $isbn) {
      id
      title
      genre
      publicationYear
      isbn
      author {
        id
        name
      }
    }
  }
`

// Common genres for the dropdown
const GENRE_OPTIONS = [
  "Sci-Fi",
  "Fantasy",
  "Mystery",
  "Horror",
  "Romance",
  "Thriller",
  "Biography",
  "History",
  "Self-Help",
  "Business",
  "Science",
  "Philosophy",
  "Poetry",
  "Drama",
  "Comedy",
  "Adventure",
  "Political Satire",
  "Non-Fiction",
  "Children",
  "Young Adult",
]

export default function EditBookPage() {
  const router = useRouter()
  const params = useParams()
  const bookId = params.id as string

  const [formState, setFormState] = useState({
    title: "",
    authorId: "",
    genre: "",
    publicationYear: "",
    isbn: "",
  })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const {
    data: bookData,
    loading: bookLoading,
    error: bookError,
  } = useQuery(GET_BOOK_FOR_EDIT, {
    variables: { id: bookId },
    errorPolicy: "all",
  })

  const { data: authorsAndGenresData, loading: dataLoading } = useQuery(GET_AUTHORS_AND_GENRES)

  const [updateBook, { loading: mutationLoading, error: mutationError }] = useMutation(UPDATE_BOOK, {
    onCompleted: () => {
      router.push(`/book/${bookId}`)
    },
    refetchQueries: ["GetBooksAndGenres", "GetBookDetails"],
  })

  // Populate form when book data loads
  useEffect(() => {
    if (bookData?.getBookDetails) {
      const book = bookData.getBookDetails
      setFormState({
        title: book.title,
        authorId: book.author.id,
        genre: book.genre,
        publicationYear: book.publicationYear.toString(),
        isbn: book.isbn,
      })
    }
  }, [bookData])

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!formState.title.trim()) newErrors.title = "Title is required."
    if (!formState.authorId) newErrors.authorId = "Author is required."
    if (!formState.genre) newErrors.genre = "Genre is required."

    const year = Number.parseInt(formState.publicationYear, 10)
    if (!formState.publicationYear) {
      newErrors.publicationYear = "Publication year is required."
    } else if (isNaN(year) || year < 1000 || year > new Date().getFullYear()) {
      newErrors.publicationYear = `Year must be between 1000 and ${new Date().getFullYear()}.`
    }

    if (!formState.isbn.trim()) {
      newErrors.isbn = "ISBN is required."
    } else if (!/^\d{13}$/.test(formState.isbn.replace(/[-\s]/g, ""))) {
      newErrors.isbn = "ISBN must be 13 digits (hyphens and spaces will be removed)."
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormState((prev) => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleSelectChange = (name: string) => (value: string) => {
    setFormState((prev) => ({ ...prev, [name]: value }))
    // Clear error when user makes selection
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      // Clean ISBN by removing hyphens and spaces
      const cleanIsbn = formState.isbn.replace(/[-\s]/g, "")
      updateBook({
        variables: {
          id: bookId,
          title: formState.title,
          authorId: formState.authorId,
          genre: formState.genre,
          publicationYear: Number.parseInt(formState.publicationYear, 10),
          isbn: cleanIsbn,
        },
      })
    }
  }

  if (bookLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-6 py-8 max-w-4xl">
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

  if (bookError || !bookData?.getBookDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-6 py-8 max-w-4xl">
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
                <p className="text-gray-600">The book you're trying to edit doesn't exist or has been removed.</p>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <Link
          href={`/book/${bookId}`}
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Book Details
        </Link>

        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
            <CardTitle className="flex items-center gap-3 text-2xl font-bold text-gray-900">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              Edit Book
            </CardTitle>
            <CardDescription className="text-base">
              Update the book information below. All fields are required.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="md:col-span-2">
                  <Label htmlFor="title" className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Book Title *
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    value={formState.title}
                    onChange={handleChange}
                    placeholder="Enter book title"
                    className={`mt-2 h-12 ${errors.title ? "border-red-500" : "border-gray-300"} focus:border-blue-500`}
                  />
                  {errors.title && <p className="text-sm text-red-600 mt-2">{errors.title}</p>}
                </div>

                <div>
                  <Label htmlFor="authorId" className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Author *
                  </Label>
                  <Select name="authorId" onValueChange={handleSelectChange("authorId")} value={formState.authorId}>
                    <SelectTrigger className={`mt-2 h-12 ${errors.authorId ? "border-red-500" : "border-gray-300"}`}>
                      <SelectValue placeholder={dataLoading ? "Loading authors..." : "Select an author"} />
                    </SelectTrigger>
                    <SelectContent>
                      {authorsAndGenresData?.getAllAuthors.map((author: any) => (
                        <SelectItem key={author.id} value={author.id}>
                          {author.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.authorId && <p className="text-sm text-red-600 mt-2">{errors.authorId}</p>}
                </div>

                <div>
                  <Label htmlFor="genre" className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Genre *
                  </Label>
                  <Select name="genre" onValueChange={handleSelectChange("genre")} value={formState.genre}>
                    <SelectTrigger className={`mt-2 h-12 ${errors.genre ? "border-red-500" : "border-gray-300"}`}>
                      <SelectValue placeholder="Select a genre" />
                    </SelectTrigger>
                    <SelectContent>
                      {GENRE_OPTIONS.map((genre) => (
                        <SelectItem key={genre} value={genre}>
                          {genre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.genre && <p className="text-sm text-red-600 mt-2">{errors.genre}</p>}
                </div>

                <div>
                  <Label
                    htmlFor="publicationYear"
                    className="text-sm font-semibold text-gray-700 uppercase tracking-wide"
                  >
                    Publication Year *
                  </Label>
                  <Input
                    id="publicationYear"
                    name="publicationYear"
                    type="number"
                    min="1000"
                    max={new Date().getFullYear()}
                    value={formState.publicationYear}
                    onChange={handleChange}
                    placeholder="e.g., 2023"
                    className={`mt-2 h-12 ${errors.publicationYear ? "border-red-500" : "border-gray-300"} focus:border-blue-500`}
                  />
                  {errors.publicationYear && <p className="text-sm text-red-600 mt-2">{errors.publicationYear}</p>}
                </div>

                <div>
                  <Label htmlFor="isbn" className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    ISBN *
                  </Label>
                  <Input
                    id="isbn"
                    name="isbn"
                    value={formState.isbn}
                    onChange={handleChange}
                    placeholder="978-0-123456-78-9"
                    className={`mt-2 h-12 ${errors.isbn ? "border-red-500" : "border-gray-300"} focus:border-blue-500`}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Enter 13-digit ISBN (hyphens and spaces will be removed automatically)
                  </p>
                  {errors.isbn && <p className="text-sm text-red-600 mt-1">{errors.isbn}</p>}
                </div>
              </div>

              {mutationError && (
                <Alert variant="destructive" className="border-red-200 bg-red-50">
                  <AlertDescription>
                    <strong>Error:</strong> {mutationError.message}
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex flex-col sm:flex-row justify-end gap-4 pt-8 border-t">
                <Link href={`/book/${bookId}`}>
                  <Button variant="outline" type="button" className="w-full sm:w-auto h-12 px-8 bg-transparent">
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={mutationLoading || dataLoading}
                  className="w-full sm:w-auto h-12 px-8 bg-blue-600 hover:bg-blue-700"
                >
                  {mutationLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating Book...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Update Book
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
