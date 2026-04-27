import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import connectDB from '@/lib/db/mongoose'
import Character from '@/lib/db/models/Character'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Не авторизовано' }, { status: 401 })
    }

    await connectDB()

    const characters = await Character.find({ user_id: session.user.id }).sort({
      createdAt: -1,
    })

    return NextResponse.json({ data: characters })
  } catch (error) {
    console.error('GET /api/characters error:', error)
    return NextResponse.json({ error: 'Помилка сервера' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Не авторизовано' }, { status: 401 })
    }

    const body = await req.json()

    if (!body.name) {
      return NextResponse.json(
        { error: 'Імʼя персонажа обовʼязкове' },
        { status: 400 },
      )
    }

    await connectDB()

    const character = await Character.create({
      ...body,
      user_id: session.user.id,
    })

    return NextResponse.json({ data: character }, { status: 201 })
  } catch (error) {
    console.error('POST /api/characters error:', error)
    return NextResponse.json({ error: 'Помилка сервера' }, { status: 500 })
  }
}
