import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import connectDB from '@/lib/db/mongoose'
import Monster from '@/lib/db/models/Monster'
import Spell from '@/lib/db/models/Spell'
import { translateMonster, translateSpell } from '@/lib/ai/translator'

export async function POST(req: NextRequest) {
  try {
    //const session = await auth()
    //if (!session || session.user.role !== 'moderator') {
    //return NextResponse.json({ error: 'Доступ заборонено' }, { status: 403 })
    //}

    const { type, limit = 10 } = await req.json()
    await connectDB()

    if (type === 'monsters') {
      const monsters = await Monster.find({ name_uk: '' }).limit(limit)
      let success = 0
      let errors = 0

      for (const monster of monsters) {
        try {
          const translated = await translateMonster({
            name_en: monster.name_en,
            description_en: monster.description_en || '',
            size: monster.size || '',
            type: monster.type || '',
            alignment: monster.alignment || '',
            skills: monster.skills || '',
            senses: monster.senses || '',
            languages: monster.languages || '',
            speed: monster.speed || '',
            armor_desc: monster.armor_desc || '',
            damage_resistances: monster.damage_resistances || '',
            damage_immunities: monster.damage_immunities || '',
            condition_immunities: monster.condition_immunities || '',
            actions: monster.actions,
            special_abilities: monster.special_abilities,
            reactions: monster.reactions,
            legendary_actions: monster.legendary_actions,
          })

          await Monster.findByIdAndUpdate(monster._id, {
            $set: {
              name_uk: translated.name_uk || '',
              size_uk: translated.size_uk || '',
              type_uk: translated.type_uk || '',
              alignment_uk: translated.alignment_uk || '',
              skills_uk: translated.skills_uk || '',
              senses_uk: translated.senses_uk || '',
              languages_uk: translated.languages_uk || '',
              speed_uk: translated.speed_uk || '',
              armor_desc_uk: translated.armor_desc_uk || '',
              damage_resistances_uk: translated.damage_resistances_uk || '',
              damage_immunities_uk: translated.damage_immunities_uk || '',
              condition_immunities_uk: translated.condition_immunities_uk || '',
              description_uk: translated.description_uk || '',
              actions: translated.actions || monster.actions,
              special_abilities:
                translated.special_abilities || monster.special_abilities,
              reactions: translated.reactions || monster.reactions,
              legendary_actions:
                translated.legendary_actions || monster.legendary_actions,
            },
          })

          success++
          console.log(`Translated monster: ${monster.name_en}`)
          await new Promise((r) => setTimeout(r, 300))
        } catch (err) {
          console.error(`Error translating monster ${monster.name_en}:`, err)
          errors++
        }
      }

      return NextResponse.json({
        message: 'Переклад монстрів завершено',
        result: { success, errors, total: monsters.length },
      })
    }

    if (type === 'spells') {
      const spells = await Spell.find({ name_uk: '' }).limit(limit)
      let success = 0
      let errors = 0

      for (const spell of spells) {
        try {
          const translated = await translateSpell({
            name_en: spell.name_en,
            school: spell.school || '',
            casting_time: spell.casting_time || '',
            range: spell.range || '',
            duration: spell.duration || '',
            components: spell.components || '',
            description_en: spell.description_en || '',
            higher_levels_en: spell.higher_levels_en || '',
          })

          await Spell.findByIdAndUpdate(spell._id, {
            $set: {
              name_uk: translated.name_uk || '',
              school_uk: translated.school_uk || '',
              casting_time_uk: translated.casting_time_uk || '',
              range_uk: translated.range_uk || '',
              duration_uk: translated.duration_uk || '',
              components_uk: translated.components_uk || '',
              description_uk: translated.description_uk || '',
              higher_levels_uk: translated.higher_levels_uk || '',
            },
          })

          success++
          console.log(`Translated spell: ${spell.name_en}`)
          await new Promise((r) => setTimeout(r, 300))
        } catch (err) {
          console.error(`Error translating spell ${spell.name_en}:`, err)
          errors++
        }
      }

      return NextResponse.json({
        message: 'Переклад заклинань завершено',
        result: { success, errors, total: spells.length },
      })
    }

    return NextResponse.json({ error: 'Невідомий тип' }, { status: 400 })
  } catch (error) {
    console.error('Translate error:', error)
    return NextResponse.json({ error: 'Помилка сервера' }, { status: 500 })
  }
}
