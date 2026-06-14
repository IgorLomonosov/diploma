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
import Condition from '@/lib/db/models/Condition'
import Equipment from '@/lib/db/models/Equipment'
import Section from '@/lib/db/models/Section'
import {
  translateMonster,
  translateSpell,
  translateRace,
  translateClass,
  translateBackground,
  translateFeat,
  translateMagicItem,
  translateCondition,
  translateEquipment,
  translateSection,
} from '@/lib/ai/translator'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session || (session.user as any).role !== 'moderator') {
      return NextResponse.json({ error: 'Доступ заборонено' }, { status: 403 })
    }

    const { type, limit = 10 } = await req.json()
    await connectDB()

    // ---- MONSTERS ----
    if (type === 'monsters') {
      const items = await Monster.find({ name_uk: '' }).limit(limit)
      let success = 0,
        errors = 0
      for (const monster of items) {
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
          await new Promise((r) => setTimeout(r, 300))
        } catch (err) {
          console.error(`Error translating monster ${monster.name_en}:`, err)
          errors++
        }
      }
      return NextResponse.json({
        message: 'Переклад монстрів завершено',
        result: { success, errors, total: items.length },
      })
    }

    // ---- SPELLS ----
    if (type === 'spells') {
      const items = await Spell.find({ name_uk: '' }).limit(limit)
      let success = 0,
        errors = 0
      for (const spell of items) {
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
          await new Promise((r) => setTimeout(r, 300))
        } catch (err) {
          console.error(`Error translating spell ${spell.name_en}:`, err)
          errors++
        }
      }
      return NextResponse.json({
        message: 'Переклад заклинань завершено',
        result: { success, errors, total: items.length },
      })
    }

    // ---- RACES ----
    if (type === 'races') {
      const items = await Race.find({ name_uk: '' }).limit(limit)
      let success = 0,
        errors = 0
      for (const race of items) {
        try {
          const translated = await translateRace({
            name_en: race.name_en,
            desc: race.desc || '',
            asi_desc: race.asi_desc || '',
            age: race.age || '',
            alignment: race.alignment || '',
            size: race.size || '',
            speed_desc: race.speed_desc || '',
            languages: race.languages || '',
            vision: race.vision || '',
            traits: race.traits || '',
            subraces: (race.subraces || []).map((s: any) => ({
              name: s.name || '',
              desc: s.desc || '',
              asi_desc: s.asi_desc || '',
              traits: s.traits || '',
            })),
          })
          await Race.findByIdAndUpdate(race._id, {
            $set: {
              name_uk: translated.name_uk || '',
              desc_uk: translated.desc_uk || '',
              asi_desc_uk: translated.asi_desc_uk || '',
              age_uk: translated.age_uk || '',
              alignment_uk: translated.alignment_uk || '',
              size_uk: translated.size_uk || '',
              speed_desc_uk: translated.speed_desc_uk || '',
              languages_uk: translated.languages_uk || '',
              vision_uk: translated.vision_uk || '',
              traits_uk: translated.traits_uk || '',
              subraces: (race.subraces || []).map((s: any, i: number) => ({
                ...s.toObject(),
                name_uk: (translated.subraces as any[])?.[i]?.name_uk || '',
                desc_uk: (translated.subraces as any[])?.[i]?.desc_uk || '',
                asi_desc_uk:
                  (translated.subraces as any[])?.[i]?.asi_desc_uk || '',
                traits_uk: (translated.subraces as any[])?.[i]?.traits_uk || '',
              })),
            },
          })
          success++
          await new Promise((r) => setTimeout(r, 300))
        } catch (err) {
          console.error(`Error translating race ${race.name_en}:`, err)
          errors++
        }
      }
      return NextResponse.json({
        message: 'Переклад рас завершено',
        result: { success, errors, total: items.length },
      })
    }

    // ---- CLASSES ----
    if (type === 'classes') {
      const items = await Class.find({ name_uk: '' }).limit(limit)
      let success = 0,
        errors = 0
      for (const cls of items) {
        try {
          const translated = await translateClass({
            name_en: cls.name_en,
            desc: cls.desc || '',
            hit_dice: cls.hit_dice || '',
            hp_at_1st_level: cls.hp_at_1st_level || '',
            hp_at_higher_levels: cls.hp_at_higher_levels || '',
            prof_armor: cls.prof_armor || '',
            prof_weapons: cls.prof_weapons || '',
            prof_tools: cls.prof_tools || '',
            prof_saving_throws: cls.prof_saving_throws || '',
            prof_skills: cls.prof_skills || '',
            equipment: cls.equipment || '',
          })
          await Class.findByIdAndUpdate(cls._id, {
            $set: {
              name_uk: translated.name_uk || '',
              desc_uk: translated.desc_uk || '',
              hp_at_1st_level_uk: translated.hp_at_1st_level_uk || '',
              hp_at_higher_levels_uk: translated.hp_at_higher_levels_uk || '',
              prof_armor_uk: translated.prof_armor_uk || '',
              prof_weapons_uk: translated.prof_weapons_uk || '',
              prof_tools_uk: translated.prof_tools_uk || '',
              prof_saving_throws_uk: translated.prof_saving_throws_uk || '',
              prof_skills_uk: translated.prof_skills_uk || '',
              equipment_uk: translated.equipment_uk || '',
            },
          })
          success++
          await new Promise((r) => setTimeout(r, 300))
        } catch (err) {
          console.error(`Error translating class ${cls.name_en}:`, err)
          errors++
        }
      }
      return NextResponse.json({
        message: 'Переклад класів завершено',
        result: { success, errors, total: items.length },
      })
    }

    // ---- BACKGROUNDS ----
    if (type === 'backgrounds') {
      const items = await Background.find({ name_uk: '' }).limit(limit)
      let success = 0,
        errors = 0
      for (const bg of items) {
        try {
          const translated = await translateBackground({
            name_en: bg.name_en,
            desc: bg.desc || '',
            skill_proficiencies: bg.skill_proficiencies || '',
            tool_proficiencies: bg.tool_proficiencies || '',
            languages: bg.languages || '',
            equipment: bg.equipment || '',
            feature: bg.feature || '',
            feature_desc: bg.feature_desc || '',
            suggested_characteristics: bg.suggested_characteristics || '',
          })
          await Background.findByIdAndUpdate(bg._id, {
            $set: {
              name_uk: translated.name_uk || '',
              desc_uk: translated.desc_uk || '',
              skill_proficiencies_uk: translated.skill_proficiencies_uk || '',
              tool_proficiencies_uk: translated.tool_proficiencies_uk || '',
              languages_uk: translated.languages_uk || '',
              equipment_uk: translated.equipment_uk || '',
              feature_uk: translated.feature_uk || '',
              feature_desc_uk: translated.feature_desc_uk || '',
              suggested_characteristics_uk:
                translated.suggested_characteristics_uk || '',
            },
          })
          success++
          await new Promise((r) => setTimeout(r, 300))
        } catch (err) {
          console.error(`Error translating background ${bg.name_en}:`, err)
          errors++
        }
      }
      return NextResponse.json({
        message: 'Переклад передісторій завершено',
        result: { success, errors, total: items.length },
      })
    }

    // ---- FEATS ----
    if (type === 'feats') {
      const items = await Feat.find({ name_uk: '' }).limit(limit)
      let success = 0,
        errors = 0
      for (const feat of items) {
        try {
          const translated = await translateFeat({
            name_en: feat.name_en,
            desc: feat.desc || '',
            prerequisite: feat.prerequisite || '',
          })
          await Feat.findByIdAndUpdate(feat._id, {
            $set: {
              name_uk: translated.name_uk || '',
              desc_uk: translated.desc_uk || '',
              prerequisite_uk: translated.prerequisite_uk || '',
            },
          })
          success++
          await new Promise((r) => setTimeout(r, 300))
        } catch (err) {
          console.error(`Error translating feat ${feat.name_en}:`, err)
          errors++
        }
      }
      return NextResponse.json({
        message: 'Переклад здібностей завершено',
        result: { success, errors, total: items.length },
      })
    }

    // ---- MAGIC ITEMS ----
    if (type === 'magic-items') {
      const items = await MagicItem.find({ name_uk: '' }).limit(limit)
      let success = 0,
        errors = 0
      for (const item of items) {
        try {
          const translated = await translateMagicItem({
            name_en: item.name_en,
            desc: item.desc || '',
            type: item.type || '',
            rarity: item.rarity || '',
          })
          await MagicItem.findByIdAndUpdate(item._id, {
            $set: {
              name_uk: translated.name_uk || '',
              desc_uk: translated.desc_uk || '',
              type_uk: translated.type_uk || '',
              rarity_uk: translated.rarity_uk || '',
            },
          })
          success++
          await new Promise((r) => setTimeout(r, 300))
        } catch (err) {
          console.error(`Error translating magic item ${item.name_en}:`, err)
          errors++
        }
      }
      return NextResponse.json({
        message: 'Переклад магічних предметів завершено',
        result: { success, errors, total: items.length },
      })
    }

    // ---- CONDITIONS ----
    if (type === 'conditions') {
      const items = await Condition.find({ name_uk: '' }).limit(limit)
      let success = 0,
        errors = 0
      for (const condition of items) {
        try {
          const translated = await translateCondition({
            name_en: condition.name_en,
            desc_en: condition.desc_en || '',
          })
          await Condition.findByIdAndUpdate(condition._id, {
            $set: {
              name_uk: translated.name_uk || '',
              desc_uk: translated.desc_uk || '',
            },
          })
          success++
          await new Promise((r) => setTimeout(r, 300))
        } catch (err) {
          console.error(
            `Error translating condition ${condition.name_en}:`,
            err,
          )
          errors++
        }
      }
      return NextResponse.json({
        message: 'Переклад станів завершено',
        result: { success, errors, total: items.length },
      })
    }

    // ---- EQUIPMENT ----
    if (type === 'equipment') {
      const items = await Equipment.find({ name_uk: '' }).limit(limit)
      let success = 0,
        errors = 0
      for (const item of items) {
        try {
          const translated = await translateEquipment({
            name_en: item.name_en,
            desc_en: item.desc_en || '',
            damage_type: item.damage_type || '',
            properties: item.properties || [],
          })
          await Equipment.findByIdAndUpdate(item._id, {
            $set: {
              name_uk: translated.name_uk || '',
              desc_uk: translated.desc_uk || '',
              damage_type_uk: translated.damage_type_uk || '',
              properties_uk: translated.properties_uk || [],
            },
          })
          success++
          await new Promise((r) => setTimeout(r, 300))
        } catch (err) {
          console.error(`Error translating equipment ${item.name_en}:`, err)
          errors++
        }
      }
      return NextResponse.json({
        message: 'Переклад спорядження завершено',
        result: { success, errors, total: items.length },
      })
    }

    // ---- SECTIONS ----
    if (type === 'sections') {
      const items = await Section.find({ name_uk: '' }).limit(limit)
      let success = 0,
        errors = 0
      for (const section of items) {
        try {
          const translated = await translateSection({
            name_en: section.name_en,
            desc_en: section.desc_en || '',
          })
          await Section.findByIdAndUpdate(section._id, {
            $set: {
              name_uk: translated.name_uk || '',
              desc_uk: translated.desc_uk || '',
            },
          })
          success++
          await new Promise((r) => setTimeout(r, 300))
        } catch (err) {
          console.error(`Error translating section ${section.name_en}:`, err)
          errors++
        }
      }
      return NextResponse.json({
        message: 'Переклад правил завершено',
        result: { success, errors, total: items.length },
      })
    }

    return NextResponse.json({ error: 'Невідомий тип' }, { status: 400 })
  } catch (error) {
    console.error('Translate error:', error)
    return NextResponse.json({ error: 'Помилка сервера' }, { status: 500 })
  }
}
