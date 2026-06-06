import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongoose'
import MagicItem from '@/lib/db/models/MagicItem'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params
    await connectDB()
    const item = await MagicItem.findOne({ slug })

    if (!item) {
      return NextResponse.json(
        { error: 'Предмет не знайдено' },
        { status: 404 },
      )
    }

    return NextResponse.json({ data: item })
  } catch (error) {
    console.error('GET /api/magic-items/[slug] error:', error)
    return NextResponse.json({ error: 'Помилка сервера' }, { status: 500 })
  }
}
