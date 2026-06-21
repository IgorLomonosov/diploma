import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI is not defined in .env.local')
}

const mongoUri: string = MONGODB_URI

type CachedMongoose = {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

declare global {
  var mongoose: CachedMongoose | undefined
}

const cached: CachedMongoose = global.mongoose ?? {
  conn: null,
  promise: null,
}

global.mongoose = cached

async function connectDB() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(mongoUri).then((m) => m)
  }

  cached.conn = await cached.promise

  return cached.conn
}

export default connectDB
