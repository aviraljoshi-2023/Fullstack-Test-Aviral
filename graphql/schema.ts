import { ObjectId } from "mongodb"
import { connectToDatabase } from "@/lib/mongodb"

export const typeDefs = `#graphql
  type Author {
    id: ID!
    name: String!
    nationality: String
    birthYear: Int
  }

  type Book {
    id: ID!
    title: String!
    author: Author!
    genre: String!
    publicationYear: Int!
    isbn: String!
  }

  type Query {
    getAllBooks: [Book!]
    getBookDetails(id: ID!): Book
    getBooksByGenre(genre: String!): [Book!]
    getAllAuthors: [Author!]
    getAllGenres: [String!]
  }

  type Mutation {
    addBook(title: String!, authorId: ID!, genre: String!, publicationYear: Int!, isbn: String!): Book
    updateBook(id: ID!, title: String, authorId: ID, genre: String, publicationYear: Int, isbn: String): Book
  }
`

export const resolvers = {
  Query: {
    getAllBooks: async () => {
      const { db } = await connectToDatabase()
      return db.collection("books").find({}).toArray()
    },
    getBookDetails: async (_: any, { id }: { id: string }) => {
      const { db } = await connectToDatabase()
      if (!ObjectId.isValid(id)) {
        throw new Error("Invalid book ID")
      }
      return db.collection("books").findOne({ _id: new ObjectId(id) })
    },
    getBooksByGenre: async (_: any, { genre }: { genre: string }) => {
      const { db } = await connectToDatabase()
      return db.collection("books").find({ genre }).toArray()
    },
    getAllAuthors: async () => {
      const { db } = await connectToDatabase()
      return db.collection("authors").find({}).toArray()
    },
    getAllGenres: async () => {
      const { db } = await connectToDatabase()
      return db.collection("books").distinct("genre")
    },
  },
  Mutation: {
    addBook: async (
      _: any,
      {
        title,
        authorId,
        genre,
        publicationYear,
        isbn,
      }: { title: string; authorId: string; genre: string; publicationYear: number; isbn: string },
    ) => {
      const { db } = await connectToDatabase()

      const existingBook = await db.collection("books").findOne({ isbn })
      if (existingBook) {
        throw new Error("A book with this ISBN already exists.")
      }

      if (!ObjectId.isValid(authorId)) {
        throw new Error("Invalid author ID")
      }

      const author = await db.collection("authors").findOne({ _id: new ObjectId(authorId) })
      if (!author) {
        throw new Error("Author not found.")
      }

      const newBook = {
        title,
        authorId: new ObjectId(authorId),
        genre,
        publicationYear,
        isbn,
      }

      const result = await db.collection("books").insertOne(newBook)

      return {
        id: result.insertedId.toString(),
        ...newBook,
        author, // Attach author object for the return type
      }
    },
    updateBook: async (
      _: any,
      {
        id,
        title,
        authorId,
        genre,
        publicationYear,
        isbn,
      }: {
        id: string
        title?: string
        authorId?: string
        genre?: string
        publicationYear?: number
        isbn?: string
      },
    ) => {
      const { db } = await connectToDatabase()

      if (!ObjectId.isValid(id)) {
        throw new Error("Invalid book ID")
      }

      // Check if book exists
      const existingBook = await db.collection("books").findOne({ _id: new ObjectId(id) })
      if (!existingBook) {
        throw new Error("Book not found.")
      }

      // If ISBN is being updated, check for duplicates
      if (isbn && isbn !== existingBook.isbn) {
        const duplicateBook = await db.collection("books").findOne({
          isbn,
          _id: { $ne: new ObjectId(id) },
        })
        if (duplicateBook) {
          throw new Error("A book with this ISBN already exists.")
        }
      }

      // If authorId is being updated, validate it exists
      if (authorId && authorId !== existingBook.authorId.toString()) {
        if (!ObjectId.isValid(authorId)) {
          throw new Error("Invalid author ID")
        }
        const author = await db.collection("authors").findOne({ _id: new ObjectId(authorId) })
        if (!author) {
          throw new Error("Author not found.")
        }
      }

      // Build update object with only provided fields
      const updateData: any = {}
      if (title !== undefined) updateData.title = title
      if (authorId !== undefined) updateData.authorId = new ObjectId(authorId)
      if (genre !== undefined) updateData.genre = genre
      if (publicationYear !== undefined) updateData.publicationYear = publicationYear
      if (isbn !== undefined) updateData.isbn = isbn

      // Update the book
      await db.collection("books").updateOne({ _id: new ObjectId(id) }, { $set: updateData })

      // Return the updated book
      const updatedBook = await db.collection("books").findOne({ _id: new ObjectId(id) })
      return updatedBook
    },
  },
  Book: {
    id: (parent: any) => parent._id.toString(),
    author: async (parent: any) => {
      const { db } = await connectToDatabase()
      return db.collection("authors").findOne({ _id: new ObjectId(parent.authorId) })
    },
  },
  Author: {
    id: (parent: any) => parent._id.toString(),
  },
}
