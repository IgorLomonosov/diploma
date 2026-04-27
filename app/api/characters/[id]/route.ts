import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import connectDB from '@/lib/db/mongoose'
import Character from '@/lib/db/models/Character'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Не авторизовано' }, { status: 401 })
    }

    await connectDB()

    const character = await Character.findOne({
      _id: params.id,
      user_id: session.user.id,
    })

    if (!character) {
      return NextResponse.json(
        { error: 'Персонажа не знайдено' },
        { status: 404 },
      )
    }

    return NextResponse.json({ data: character })
  } catch (error) {
    console.error('GET /api/characters/[id] error:', error)
    return NextResponse.json({ error: 'Помилка сервера' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Не авторизовано' }, { status: 401 })
    }

    const body = await req.json()

    await connectDB()

    const character = await Character.findOneAndUpdate(
      { _id: params.id, user_id: session.user.id },
      { $set: body },
      { new: true },
    )

    if (!character) {
      return NextResponse.json(
        { error: 'Персонажа не знайдено' },
        { status: 404 },
      )
    }

    return NextResponse.json({ data: character })
  } catch (error) {
    console.error('PATCH /api/characters/[id] error:', error)
    return NextResponse.json({ error: 'Помилка сервера' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Не авторизовано' }, { status: 401 })
    }

    await connectDB()

    const character = await Character.findOneAndDelete({
      _id: params.id,
      user_id: session.user.id,
    })

    if (!character) {
      return NextResponse.json(
        { error: 'Персонажа не знайдено' },
        { status: 404 },
      )
    }

    return NextResponse.json({ message: 'Персонажа видалено' })
  } catch (error) {
    console.error('DELETE /api/characters/[id] error:', error)
    return NextResponse.json({ error: 'Помилка сервера' }, { status: 500 })
  }
}
