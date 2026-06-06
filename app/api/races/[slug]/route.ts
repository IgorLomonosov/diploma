import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongoose'
import Race from '@/lib/db/models/Race'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params
    await connectDB()
    const race = await Race.findOne({ slug })

    if (!race) {
      return NextResponse.json({ error: 'Расу не знайдено' }, { status: 404 })
    }

    return NextResponse.json({ data: race })
  } catch (error) {
    console.error('GET /api/races/[slug] error:', error)
    return NextResponse.json({ error: 'Помилка сервера' }, { status: 500 })
  }
}
