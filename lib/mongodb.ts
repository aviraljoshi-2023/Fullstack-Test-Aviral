import { MongoClient, type Db } from "mongodb"

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017"
const MONGODB_DB = "library"

let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local")
}

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb }
  }

  try {
    console.log("Attempting to connect to MongoDB...")
    console.log("MONGODB_URI:", MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, "//***:***@")) // Hide password in logs

    const client = await MongoClient.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    })

    const db = client.db(MONGODB_DB)

    // Test the connection
    await db.admin().ping()

    cachedClient = client
    cachedDb = db

    console.log("Successfully connected to MongoDB.")
    return { client, db }
  } catch (error) {
    console.error("MongoDB connection error details:", error)

    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes("ENOTFOUND")) {
        throw new Error("Cannot resolve MongoDB hostname. Check your internet connection and connection string.")
      } else if (error.message.includes("authentication failed")) {
        throw new Error("MongoDB authentication failed. Check your username and password.")
      } else if (error.message.includes("ECONNREFUSED")) {
        throw new Error("Connection refused. Make sure MongoDB is running.")
      } else if (error.message.includes("SSL") || error.message.includes("TLS")) {
        throw new Error("SSL/TLS connection error. Try updating your MongoDB driver or check network settings.")
      } else {
        throw new Error(`MongoDB connection failed: ${error.message}`)
      }
    }

    throw new Error("Could not connect to the database.")
  }
}
