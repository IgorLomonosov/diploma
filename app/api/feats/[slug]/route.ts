import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongoose'
import Feat from '@/lib/db/models/Feat'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params
    await connectDB()
    const feat = await Feat.findOne({ slug })

    if (!feat) {
      return NextResponse.json(
        { error: 'Здібність не знайдено' },
        { status: 404 },
      )
    }

    return NextResponse.json({ data: feat })
  } catch (error) {
    console.error('GET /api/feats/[slug] error:', error)
    return NextResponse.json({ error: 'Помилка сервера' }, { status: 500 })
  }
}
