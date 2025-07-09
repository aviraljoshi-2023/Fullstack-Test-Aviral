import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    console.log("🌱 Starting database seeding...")

    const { db } = await connectToDatabase()

    // Clear existing data
    console.log("🧹 Clearing existing data...")
    await db.collection("authors").deleteMany({})
    await db.collection("books").deleteMany({})
    console.log("✅ Existing data cleared")

    // Create authors with ObjectIds
    console.log("👥 Creating authors...")
    const authors = [
      {
        _id: new ObjectId(),
        name: "George Orwell",
        nationality: "British",
        birthYear: 1903,
      },
      {
        _id: new ObjectId(),
        name: "Isaac Asimov",
        nationality: "American",
        birthYear: 1920,
      },
      {
        _id: new ObjectId(),
        name: "Agatha Christie",
        nationality: "British",
        birthYear: 1890,
      },
      {
        _id: new ObjectId(),
        name: "J.K. Rowling",
        nationality: "British",
        birthYear: 1965,
      },
      {
        _id: new ObjectId(),
        name: "Stephen King",
        nationality: "American",
        birthYear: 1947,
      },
    ]

    const authorResult = await db.collection("authors").insertMany(authors)
    console.log(`✅ Created ${authorResult.insertedCount} authors`)

    // Create books
    console.log("📚 Creating books...")
    const books = [
      {
        title: "1984",
        authorId: authors[0]._id,
        genre: "Sci-Fi",
        publicationYear: 1949,
        isbn: "9780451524935",
      },
      {
        title: "Animal Farm",
        authorId: authors[0]._id,
        genre: "Political Satire",
        publicationYear: 1945,
        isbn: "9780451526342",
      },
      {
        title: "Foundation",
        authorId: authors[1]._id,
        genre: "Sci-Fi",
        publicationYear: 1951,
        isbn: "9780553803716",
      },
      {
        title: "I, Robot",
        authorId: authors[1]._id,
        genre: "Sci-Fi",
        publicationYear: 1950,
        isbn: "9780553294385",
      },
      {
        title: "The Murder of Roger Ackroyd",
        authorId: authors[2]._id,
        genre: "Mystery",
        publicationYear: 1926,
        isbn: "9780007527526",
      },
      {
        title: "And Then There Were None",
        authorId: authors[2]._id,
        genre: "Mystery",
        publicationYear: 1939,
        isbn: "9780062073488",
      },
      {
        title: "Harry Potter and the Philosopher's Stone",
        authorId: authors[3]._id,
        genre: "Fantasy",
        publicationYear: 1997,
        isbn: "9780747532699",
      },
      {
        title: "Harry Potter and the Chamber of Secrets",
        authorId: authors[3]._id,
        genre: "Fantasy",
        publicationYear: 1998,
        isbn: "9780747538493",
      },
      {
        title: "The Shining",
        authorId: authors[4]._id,
        genre: "Horror",
        publicationYear: 1977,
        isbn: "9780307743657",
      },
      {
        title: "It",
        authorId: authors[4]._id,
        genre: "Horror",
        publicationYear: 1986,
        isbn: "9781501142970",
      },
      {
        title: "The Stand",
        authorId: authors[4]._id,
        genre: "Horror",
        publicationYear: 1978,
        isbn: "9780307743688",
      },
    ]

    const bookResult = await db.collection("books").insertMany(books)
    console.log(`✅ Created ${bookResult.insertedCount} books`)

    // Create unique index for ISBN to prevent duplicates
    console.log("🔧 Creating indexes...")
    try {
      await db.collection("books").createIndex({ isbn: 1 }, { unique: true })
      console.log("✅ Created unique index on ISBN")
    } catch (indexError) {
      console.log("ℹ️ Index may already exist, continuing...")
    }

    const genres = [...new Set(books.map((book) => book.genre))]

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully! 🎉",
      data: {
        authorsCreated: authors.length,
        booksCreated: books.length,
        genres: genres,
        authors: authors.map((a) => ({ name: a.name, nationality: a.nationality })),
        books: books.map((b) => ({ title: b.title, genre: b.genre, year: b.publicationYear })),
      },
    })
  } catch (error) {
    console.error("❌ Error seeding database:", error)

    let errorMessage = "Unknown error occurred"

    if (error instanceof Error) {
      if (error.message.includes("ENOTFOUND")) {
        errorMessage = "Network/DNS issue. Check your internet connection."
      } else if (error.message.includes("authentication failed")) {
        errorMessage = "MongoDB authentication failed. Check your username and password."
      } else if (error.message.includes("duplicate key")) {
        errorMessage = "Duplicate data detected. The script may have run before."
      } else {
        errorMessage = error.message
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Database seeder endpoint. Use POST method to seed the database.",
    usage: "Send a POST request to this endpoint to populate the database with sample data.",
  })
}
