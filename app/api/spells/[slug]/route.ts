import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongoose'
import Spell from '@/lib/db/models/Spell'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params
    await connectDB()

    const spell = await Spell.findOne({ slug })

    if (!spell) {
      return NextResponse.json(
        { error: 'Заклинання не знайдено' },
        { status: 404 },
      )
    }

    return NextResponse.json({ data: spell })
  } catch (error) {
    console.error('GET /api/spells/[slug] error:', error)
    return NextResponse.json({ error: 'Помилка сервера' }, { status: 500 })
  }
}
