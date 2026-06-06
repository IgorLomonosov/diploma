import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongoose'
import Background from '@/lib/db/models/Background'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params
    await connectDB()
    const background = await Background.findOne({ slug })

    if (!background) {
      return NextResponse.json(
        { error: 'Передісторію не знайдено' },
        { status: 404 },
      )
    }

    return NextResponse.json({ data: background })
  } catch (error) {
    console.error('GET /api/backgrounds/[slug] error:', error)
    return NextResponse.json({ error: 'Помилка сервера' }, { status: 500 })
  }
}
