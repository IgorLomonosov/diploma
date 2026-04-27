import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongoose'
import Spell from '@/lib/db/models/Spell'

export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const level = searchParams.get('level') || ''
    const school = searchParams.get('school') || ''
    const className = searchParams.get('class') || ''

    const query: Record<string, unknown> = {}

    if (search) {
      query.$or = [
        { name_en: { $regex: search, $options: 'i' } },
        { name_uk: { $regex: search, $options: 'i' } },
      ]
    }

    if (level) query.level = parseInt(level)
    if (school) query.school = { $regex: school, $options: 'i' }
    if (className) query.classes = { $in: [new RegExp(className, 'i')] }

    const skip = (page - 1) * limit
    const total = await Spell.countDocuments(query)
    const spells = await Spell.find(query)
      .skip(skip)
      .limit(limit)
      .select('-description_uk -higher_levels_uk')
      .sort({ level: 1, name_en: 1 })

    return NextResponse.json({
      data: spells,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('GET /api/spells error:', error)
    return NextResponse.json({ error: 'Помилка сервера' }, { status: 500 })
  }
}
