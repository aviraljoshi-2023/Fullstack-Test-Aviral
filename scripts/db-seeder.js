const { MongoClient, ObjectId } = require("mongodb")

// Load environment variables from .env.local
require("dotenv").config({ path: ".env.local" })

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017"
const MONGODB_DB = "library"

async function seed() {
  if (!MONGODB_URI) {
    console.error("MONGODB_URI is not defined in .env.local")
    process.exit(1)
  }

  console.log("Connecting to:", MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, "//***:***@"))

  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    console.log("Connected to MongoDB")
    const db = client.db(MONGODB_DB)

    // Clear existing data
    await db.collection("authors").deleteMany({})
    await db.collection("books").deleteMany({})
    console.log("Cleared existing data.")

    // Seed Authors
    const authors = [
      { _id: new ObjectId(), name: "George Orwell", nationality: "British", birthYear: 1903 },
      { _id: new ObjectId(), name: "Isaac Asimov", nationality: "American", birthYear: 1920 },
      { _id: new ObjectId(), name: "Agatha Christie", nationality: "British", birthYear: 1890 },
    ]
    await db.collection("authors").insertMany(authors)
    console.log("Seeded authors:", authors.length)

    // Seed Books
    const books = [
      { title: "1984", authorId: authors[0]._id, genre: "Sci-Fi", publicationYear: 1949, isbn: "9780451524935" },
      { title: "Foundation", authorId: authors[1]._id, genre: "Sci-Fi", publicationYear: 1951, isbn: "9780553803716" },
      {
        title: "The Murder of Roger Ackroyd",
        authorId: authors[2]._id,
        genre: "Mystery",
        publicationYear: 1926,
        isbn: "9780007527526",
      },
      {
        title: "Animal Farm",
        authorId: authors[0]._id,
        genre: "Political Satire",
        publicationYear: 1945,
        isbn: "9780451526342",
      },
      {
        title: "And Then There Were None",
        authorId: authors[2]._id,
        genre: "Mystery",
        publicationYear: 1939,
        isbn: "9780062073488",
      },
    ]
    await db.collection("books").insertMany(books)
    console.log("Seeded books:", books.length)

    // Create unique index for ISBN
    await db.collection("books").createIndex({ isbn: 1 }, { unique: true })
    console.log("Created unique index on ISBN.")

    console.log("Database seeding completed successfully!")
  } catch (error) {
    console.error("Error seeding database:", error)
    process.exit(1)
  } finally {
    await client.close()
    console.log("MongoDB connection closed.")
  }
}

seed()
