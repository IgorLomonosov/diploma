import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongoose'
import Race from '@/lib/db/models/Race'

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
    const total = await Race.countDocuments(query)
    const races = await Race.find(query)
      .skip(skip)
      .limit(limit)
      .select('slug name_en name_uk size speed document_title')
      .sort({ name_en: 1 })

    return NextResponse.json({
      data: races,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('GET /api/races error:', error)
    return NextResponse.json({ error: 'Помилка сервера' }, { status: 500 })
  }
}
