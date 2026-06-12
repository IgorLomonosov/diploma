import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongoose'
import Section from '@/lib/db/models/Section'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params
    await connectDB()
    const section = await Section.findOne({ slug })
    if (!section) {
      return NextResponse.json({ error: 'Не знайдено' }, { status: 404 })
    }
    return NextResponse.json({ data: section })
  } catch (error) {
    return NextResponse.json({ error: 'Помилка сервера' }, { status: 500 })
  }
}
