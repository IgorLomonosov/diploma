import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import connectDB from '@/lib/db/mongoose'
import Monster from '@/lib/db/models/Monster'
import Spell from '@/lib/db/models/Spell'
import Race from '@/lib/db/models/Race'
import Class from '@/lib/db/models/Class'
import Background from '@/lib/db/models/Background'
import Feat from '@/lib/db/models/Feat'
import MagicItem from '@/lib/db/models/MagicItem'
import Condition from '@/lib/db/models/Condition'
import Equipment from '@/lib/db/models/Equipment'
import Section from '@/lib/db/models/Section'

const MODELS: Record<string, any> = {
  monsters: Monster,
  spells: Spell,
  races: Race,
  classes: Class,
  backgrounds: Background,
  feats: Feat,
  'magic-items': MagicItem,
  conditions: Condition,
  equipment: Equipment,
  sections: Section,
}

function checkAuth(session: any) {
  const role = (session?.user as any)?.role
  return session && ['moderator', 'admin'].includes(role)
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> },
) {
  try {
    const session = await auth()
    if (!checkAuth(session)) {
      return NextResponse.json({ error: 'Доступ заборонено' }, { status: 403 })
    }

    const { type, id } = await params
    const Model = MODELS[type]

    if (!Model) {
      return NextResponse.json({ error: 'Невідомий тип' }, { status: 400 })
    }

    await connectDB()
    const deleted = await Model.findByIdAndDelete(id)

    if (!deleted) {
      return NextResponse.json({ error: 'Запис не знайдено' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Видалено успішно' })
  } catch (error) {
    console.error('DELETE /api/admin/content error:', error)
    return NextResponse.json({ error: 'Помилка сервера' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> },
) {
  try {
    const session = await auth()
    if (!checkAuth(session)) {
      return NextResponse.json({ error: 'Доступ заборонено' }, { status: 403 })
    }

    const { type, id } = await params
    const Model = MODELS[type]

    if (!Model) {
      return NextResponse.json({ error: 'Невідомий тип' }, { status: 400 })
    }

    const body = await req.json()
    await connectDB()

    const updated = await Model.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true },
    )

    if (!updated) {
      return NextResponse.json({ error: 'Запис не знайдено' }, { status: 404 })
    }

    return NextResponse.json({ data: updated })
  } catch (error) {
    console.error('PATCH /api/admin/content error:', error)
    return NextResponse.json({ error: 'Помилка сервера' }, { status: 500 })
  }
}
