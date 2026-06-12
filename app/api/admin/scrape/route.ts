import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import {
  scrapeMonsters,
  scrapeSpells,
  scrapeRaces,
  scrapeClasses,
  scrapeBackgrounds,
  scrapeFeats,
  scrapeMagicItems,
  scrapeConditions,
  scrapeEquipment,
  scrapeSections,
} from '@/lib/scrapers/scraper'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session || session.user.role !== 'moderator') {
      return NextResponse.json({ error: 'Доступ заборонено' }, { status: 403 })
    }

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

    if (type === 'races') {
      const result = await scrapeRaces(maxPages || 5, document || '')
      return NextResponse.json({ message: 'Скрапінг рас завершено', result })
    }

    if (type === 'classes') {
      const result = await scrapeClasses(maxPages || 5, document || '')
      return NextResponse.json({ message: 'Скрапінг класів завершено', result })
    }

    if (type === 'backgrounds') {
      const result = await scrapeBackgrounds(maxPages || 5, document || '')
      return NextResponse.json({
        message: 'Скрапінг передісторій завершено',
        result,
      })
    }

    if (type === 'feats') {
      const result = await scrapeFeats(maxPages || 5, document || '')
      return NextResponse.json({
        message: 'Скрапінг здібностей завершено',
        result,
      })
    }

    if (type === 'magic-items') {
      const result = await scrapeMagicItems(maxPages || 5, document || '')
      return NextResponse.json({
        message: 'Скрапінг магічних предметів завершено',
        result,
      })
    }

    if (type === 'conditions') {
      const result = await scrapeConditions()
      return NextResponse.json({ message: 'Скрапінг станів завершено', result })
    }

    if (type === 'equipment') {
      const result = await scrapeEquipment()
      return NextResponse.json({
        message: 'Скрапінг спорядження завершено',
        result,
      })
    }

    if (type === 'sections') {
      const result = await scrapeSections(5)
      return NextResponse.json({ message: 'Скрапінг правил завершено', result })
    }

    return NextResponse.json({ error: 'Невідомий тип' }, { status: 400 })
  } catch (error) {
    console.error('Scrape error:', error)
    return NextResponse.json({ error: 'Помилка сервера' }, { status: 500 })
  }
}
