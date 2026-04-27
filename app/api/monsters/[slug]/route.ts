import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongoose'
import Monster from '@/lib/db/models/Monster'

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } },
) {
  try {
    await connectDB()

    const monster = await Monster.findOne({ slug: params.slug })

    if (!monster) {
      return NextResponse.json(
        { error: 'Монстра не знайдено' },
        { status: 404 },
      )
    }

    return NextResponse.json({ data: monster })
  } catch (error) {
    console.error('GET /api/monsters/[slug] error:', error)
    return NextResponse.json({ error: 'Помилка сервера' }, { status: 500 })
  }
}
