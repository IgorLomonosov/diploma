import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { scrapeMonsters, scrapeSpells } from '@/lib/scrapers/scraper'

export async function POST(req: NextRequest) {
  try {
    //const session = await auth()

    //if (!session || session.user.role !== 'moderator') {
    //return NextResponse.json({ error: 'Доступ заборонено' }, { status: 403 })
    //}

    const { type, maxPages, document } = await req.json()

    if (type === 'monsters') {
      const result = await scrapeMonsters(maxPages || 5, document || '')
      return NextResponse.json({
        message: 'Скрапінг монстрів завершено',
        result,
      })
    }

    if (type === 'spells') {
      const result = await scrapeSpells(maxPages || 5)
      return NextResponse.json({
        message: 'Скрапінг заклинань завершено',
        result,
      })
    }

    return NextResponse.json({ error: 'Невідомий тип' }, { status: 400 })
  } catch (error) {
    console.error('Scrape error:', error)
    return NextResponse.json({ error: 'Помилка сервера' }, { status: 500 })
  }
}
