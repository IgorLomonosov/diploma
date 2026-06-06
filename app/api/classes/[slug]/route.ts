import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongoose'
import Class from '@/lib/db/models/Class'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params
    await connectDB()
    const cls = await Class.findOne({ slug })

    if (!cls) {
      return NextResponse.json({ error: 'Клас не знайдено' }, { status: 404 })
    }

    return NextResponse.json({ data: cls })
  } catch (error) {
    console.error('GET /api/classes/[slug] error:', error)
    return NextResponse.json({ error: 'Помилка сервера' }, { status: 500 })
  }
}
