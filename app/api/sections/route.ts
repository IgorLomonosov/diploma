import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongoose'
import Section from '@/lib/db/models/Section'

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''

    const query: Record<string, unknown> = {}
    if (search) {
      query.$or = [
        { name_en: { $regex: search, $options: 'i' } },
        { name_uk: { $regex: search, $options: 'i' } },
      ]
    }

    const skip = (page - 1) * limit
    const total = await Section.countDocuments(query)
    const sections = await Section.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ name_en: 1 })
      .select('slug name_en name_uk parent document_title')

    return NextResponse.json({
      data: sections,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Помилка сервера' }, { status: 500 })
  }
}
