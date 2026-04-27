import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import connectDB from '@/lib/db/mongoose'
import User from '@/lib/db/models/User'

export async function POST(req: NextRequest) {
  try {
    const { username, email, password } = await req.json()

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'Всі поля обовʼязкові' },
        { status: 400 },
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Пароль має бути не менше 6 символів' },
        { status: 400 },
      )
    }

    await connectDB()

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json(
        { error: 'Користувач з таким email вже існує' },
        { status: 409 },
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    })

    return NextResponse.json(
      {
        message: 'Користувача створено успішно',
        user: {
          id: user._id.toString(),
          username: user.username,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json({ error: 'Помилка сервера' }, { status: 500 })
  }
}
