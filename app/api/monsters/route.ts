import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongoose'
import Monster from '@/lib/db/models/Monster'

export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const cr = searchParams.get('cr') || ''
    const size = searchParams.get('size') || ''
    const query: Record<string, unknown> = {}

    if (search) {
      query.$or = [
        { name_en: { $regex: search, $options: 'i' } },
        { name_uk: { $regex: search, $options: 'i' } },
      ]
    }

    if (cr) query.challenge_rating = cr
    if (size) query.size = { $regex: size, $options: 'i' }
    const skip = (page - 1) * limit
    const total = await Monster.countDocuments(query)
    const monsters = await Monster.find(query)
      .skip(skip)
      .limit(limit)
      .select(
        'slug name_en name_uk size type type_uk alignment challenge_rating hit_points armor_class document_title',
      )
      .sort({ name_en: 1 })

    return NextResponse.json({
      data: monsters,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('GET /api/monsters error:', error)
    return NextResponse.json({ error: 'Помилка сервера' }, { status: 500 })
  }
}
