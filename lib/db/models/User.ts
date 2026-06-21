import mongoose, { Schema, Document } from 'mongoose'

export interface IUser extends Document {
  username: string
  email: string
  password: string
  role: 'player' | 'dm' | 'moderator'
  createdAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    role: {
      type: String,
      enum: ['player', 'moderator', 'admin'],
      default: 'player',
    },
  },
  { timestamps: true },
)

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
