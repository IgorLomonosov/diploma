import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongoose'
import Background from '@/lib/db/models/Background'

export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '21')
    const search = searchParams.get('search') || ''

    const query: Record<string, unknown> = {}
    if (search) {
      query.$or = [
        { name_en: { $regex: search, $options: 'i' } },
        { name_uk: { $regex: search, $options: 'i' } },
      ]
    }

    const skip = (page - 1) * limit
    const total = await Background.countDocuments(query)
    const backgrounds = await Background.find(query)
      .skip(skip)
      .limit(limit)
      .select('slug name_en name_uk skill_proficiencies document_title')
      .sort({ name_en: 1 })

    return NextResponse.json({
      data: backgrounds,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('GET /api/backgrounds error:', error)
    return NextResponse.json({ error: 'Помилка сервера' }, { status: 500 })
  }
}
