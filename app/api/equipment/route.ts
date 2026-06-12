import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongoose'
import Equipment from '@/lib/db/models/Equipment'

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '21')
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''

    const query: Record<string, unknown> = {}
    if (search) {
      query.$or = [
        { name_en: { $regex: search, $options: 'i' } },
        { name_uk: { $regex: search, $options: 'i' } },
      ]
    }
    if (category) query.category = category

    const skip = (page - 1) * limit
    const total = await Equipment.countDocuments(query)
    const items = await Equipment.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ name_en: 1 })
      .select(
        'slug name_en name_uk category armor_category damage_dice damage_type weapon_range armor_class cost',
      )

    return NextResponse.json({
      data: items,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Помилка сервера' }, { status: 500 })
  }
}
