import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongoose'
import Feat from '@/lib/db/models/Feat'

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
    const total = await Feat.countDocuments(query)
    const feats = await Feat.find(query)
      .skip(skip)
      .limit(limit)
      .select(
        'slug name_en name_uk prerequisite prerequisite_uk document_title',
      )
      .sort({ name_en: 1 })

    return NextResponse.json({
      data: feats,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('GET /api/feats error:', error)
    return NextResponse.json({ error: 'Помилка сервера' }, { status: 500 })
  }
}
