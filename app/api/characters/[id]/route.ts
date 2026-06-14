import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import connectDB from '@/lib/db/mongoose'
import Character from '@/lib/db/models/Character'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Не авторизовано' }, { status: 401 })
    }

    await connectDB()

    const character = await Character.findOne({
      _id: id,
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
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Не авторизовано' }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    await connectDB()

    const { saving_throws, ...rest } = body

    const updateData: any = { $set: { ...rest } }

    if (saving_throws) {
      updateData.$set['saving_throws.strength'] =
        saving_throws.strength ?? false
      updateData.$set['saving_throws.dexterity'] =
        saving_throws.dexterity ?? false
      updateData.$set['saving_throws.constitution'] =
        saving_throws.constitution ?? false
      updateData.$set['saving_throws.intelligence'] =
        saving_throws.intelligence ?? false
      updateData.$set['saving_throws.wisdom'] = saving_throws.wisdom ?? false
      updateData.$set['saving_throws.charisma'] =
        saving_throws.charisma ?? false
    }

    const character = await Character.findOneAndUpdate(
      { _id: id, user_id: session.user.id },
      updateData,
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
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Не авторизовано' }, { status: 401 })
    }

    await connectDB()

    const character = await Character.findOneAndDelete({
      _id: id,
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
