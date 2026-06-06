import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongoose'
import MagicItem from '@/lib/db/models/MagicItem'

export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '21')
    const search = searchParams.get('search') || ''
    const rarity = searchParams.get('rarity') || ''
    const type = searchParams.get('type') || ''

    const query: Record<string, unknown> = {}
    if (search) {
      query.$or = [
        { name_en: { $regex: search, $options: 'i' } },
        { name_uk: { $regex: search, $options: 'i' } },
      ]
    }
    if (rarity && rarity !== 'all')
      query.rarity = { $regex: rarity, $options: 'i' }
    if (type && type !== 'all') query.type = { $regex: type, $options: 'i' }

    const skip = (page - 1) * limit
    const total = await MagicItem.countDocuments(query)
    const items = await MagicItem.find(query)
      .skip(skip)
      .limit(limit)
      .select(
        'slug name_en name_uk type type_uk rarity rarity_uk requires_attunement document_title',
      )
      .sort({ name_en: 1 })

    return NextResponse.json({
      data: items,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('GET /api/magic-items error:', error)
    return NextResponse.json({ error: 'Помилка сервера' }, { status: 500 })
  }
}
