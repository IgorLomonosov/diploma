import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import connectDB from '@/lib/db/mongoose'
import Monster from '@/lib/db/models/Monster'
import Spell from '@/lib/db/models/Spell'
import Race from '@/lib/db/models/Race'
import Class from '@/lib/db/models/Class'
import Background from '@/lib/db/models/Background'
import Feat from '@/lib/db/models/Feat'
import MagicItem from '@/lib/db/models/MagicItem'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
const model = genAI.getGenerativeModel(
  { model: 'gemini-2.5-flash' },
  { apiVersion: 'v1' },
)

async function searchContext(query: string): Promise<string> {
  const q = { $regex: query, $options: 'i' }
  const nameQuery = { $or: [{ name_en: q }, { name_uk: q }] }

  const [monsters, spells, races, classes, backgrounds, feats, items] =
    await Promise.all([
      Monster.find(nameQuery)
        .limit(3)
        .select(
          'name_en name_uk type challenge_rating hit_points armor_class description_uk',
        )
        .lean(),
      Spell.find(nameQuery)
        .limit(3)
        .select(
          'name_en name_uk level school casting_time range duration description_uk description_en',
        )
        .lean(),
      Race.find(nameQuery)
        .limit(2)
        .select('name_en name_uk size speed traits desc_uk')
        .lean(),
      Class.find(nameQuery)
        .limit(2)
        .select('name_en name_uk hit_dice prof_saving_throws desc_uk')
        .lean(),
      Background.find(nameQuery)
        .limit(2)
        .select('name_en name_uk skill_proficiencies feature feature_desc_uk')
        .lean(),
      Feat.find(nameQuery)
        .limit(2)
        .select('name_en name_uk prerequisite desc_uk desc')
        .lean(),
      MagicItem.find(nameQuery)
        .limit(3)
        .select('name_en name_uk type rarity requires_attunement desc_uk desc')
        .lean(),
    ])

  const parts: string[] = []

  if (monsters.length) {
    parts.push('=== МОНСТРИ ===')
    monsters.forEach((m: any) => {
      parts.push(
        `${m.name_uk || m.name_en} (CR ${m.challenge_rating}, ПЗ: ${m.hit_points}, КО: ${m.armor_class})`,
      )
      if (m.description_uk) parts.push(m.description_uk.slice(0, 300))
    })
  }
  if (spells.length) {
    parts.push('=== ЗАКЛИНАННЯ ===')
    spells.forEach((s: any) => {
      parts.push(
        `${s.name_uk || s.name_en} (${s.level} рівень, ${s.school}, час: ${s.casting_time}, дистанція: ${s.range})`,
      )
      const desc = s.description_uk || s.description_en
      if (desc) parts.push(desc.slice(0, 300))
    })
  }
  if (races.length) {
    parts.push('=== РАСИ ===')
    races.forEach((r: any) => {
      parts.push(
        `${r.name_uk || r.name_en} (розмір: ${r.size}, швидкість: ${r.speed})`,
      )
      if (r.desc_uk) parts.push(r.desc_uk.slice(0, 200))
    })
  }
  if (classes.length) {
    parts.push('=== КЛАСИ ===')
    classes.forEach((c: any) => {
      parts.push(
        `${c.name_uk || c.name_en} (кості ПЗ: ${c.hit_dice}, рятівні кидки: ${c.prof_saving_throws})`,
      )
      if (c.desc_uk) parts.push(c.desc_uk.slice(0, 200))
    })
  }
  if (backgrounds.length) {
    parts.push('=== ПЕРЕДІСТОРІЇ ===')
    backgrounds.forEach((b: any) => {
      parts.push(
        `${b.name_uk || b.name_en} (навички: ${b.skill_proficiencies})`,
      )
      if (b.feature_desc_uk) parts.push(b.feature_desc_uk.slice(0, 200))
    })
  }
  if (feats.length) {
    parts.push('=== ЗДІБНОСТІ ===')
    feats.forEach((f: any) => {
      parts.push(
        `${f.name_uk || f.name_en}${f.prerequisite ? ` (передумова: ${f.prerequisite})` : ''}`,
      )
      const desc = f.desc_uk || f.desc
      if (desc) parts.push(desc.slice(0, 200))
    })
  }
  if (items.length) {
    parts.push('=== МАГІЧНІ ПРЕДМЕТИ ===')
    items.forEach((i: any) => {
      parts.push(
        `${i.name_uk || i.name_en} (${i.type}, ${i.rarity}${i.requires_attunement && i.requires_attunement !== 'no' ? ', потребує налаштування' : ''})`,
      )
      const desc = i.desc_uk || i.desc
      if (desc) parts.push(desc.slice(0, 200))
    })
  }

  return parts.join('\n')
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Не авторизовано' }, { status: 401 })
    }

    const { message, history } = await req.json()
    if (!message?.trim()) {
      return NextResponse.json(
        { error: 'Повідомлення порожнє' },
        { status: 400 },
      )
    }

    await connectDB()

    // Шукаємо ключові слова для RAG
    const keywords = message
      .replace(/[?!.,]/g, '')
      .split(' ')
      .filter((w: string) => w.length > 3)
      .slice(0, 5)
      .join('|')

    const context = keywords ? await searchContext(keywords) : ''

    const systemPrompt = `Ти — AI асистент для гравців та майстрів підземель у грі Dungeons & Dragons 5e.
Відповідай ТІЛЬКИ українською мовою.
Будь корисним, точним та дружнім.
Завжди завершуй відповідь повністю — не обривай на середині.
Якщо питання стосується правил, механік або контенту D&D — спирайся на наданий контекст з бази даних.
Якщо контексту недостатньо — відповідай на основі загальних знань про D&D 5e.
Використовуй D&D термінологію: ПЗ (Пункти здоров'я), КО (Клас обладунку), ПН (Показник небезпеки), бонус майстерності, рятівний кидок, перевага/недолік.`

    const contextBlock = context
      ? `\n\nКОНТЕКСТ З БАЗИ ДАНИХ:\n${context}\n\n`
      : ''

    // Формуємо historію для Gemini
    const geminiHistory = (history || []).map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }))

    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: systemPrompt }],
        },
        {
          role: 'model',
          parts: [
            {
              text: 'Зрозумів! Я готовий допомагати з питаннями про D&D 5e українською мовою.',
            },
          ],
        },
        ...geminiHistory,
      ],
      generationConfig: { temperature: 0.7, maxOutputTokens: 2000 },
    })

    const result = await chat.sendMessage(contextBlock + message)
    const reply = result.response.text()

    return NextResponse.json({ reply })
  } catch (error: any) {
    console.error('POST /api/chat error:', error)
    return NextResponse.json({ error: 'Помилка сервера' }, { status: 500 })
  }
}
