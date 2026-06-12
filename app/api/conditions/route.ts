import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongoose'
import Condition from '@/lib/db/models/Condition'

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''

    const query: Record<string, unknown> = {}
    if (search) {
      query.$or = [
        { name_en: { $regex: search, $options: 'i' } },
        { name_uk: { $regex: search, $options: 'i' } },
      ]
    }

    const conditions = await Condition.find(query)
      .sort({ name_en: 1 })
      .select('slug name_en name_uk desc_en desc_uk document_title')

    return NextResponse.json({ data: conditions, total: conditions.length })
  } catch (error) {
    return NextResponse.json({ error: 'Помилка сервера' }, { status: 500 })
  }
}
