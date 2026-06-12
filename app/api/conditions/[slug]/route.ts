import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongoose'
import Condition from '@/lib/db/models/Condition'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params
    await connectDB()
    const condition = await Condition.findOne({ slug })
    if (!condition) {
      return NextResponse.json({ error: 'Не знайдено' }, { status: 404 })
    }
    return NextResponse.json({ data: condition })
  } catch (error) {
    return NextResponse.json({ error: 'Помилка сервера' }, { status: 500 })
  }
}
