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
    const role = (session?.user as any)?.role

    if (!session || !['moderator', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Доступ заборонено' }, { status: 403 })
    }

    const { type, id } = await req.json()
    await connectDB()

    if (type === 'monsters') {
      const item = await Monster.findById(id)
      if (!item)
        return NextResponse.json({ error: 'Не знайдено' }, { status: 404 })
      const translated = await translateMonster({
        name_en: item.name_en,
        description_en: item.description_en || '',
        size: item.size || '',
        type: item.type || '',
        alignment: item.alignment || '',
        skills: item.skills || '',
        senses: item.senses || '',
        languages: item.languages || '',
        speed: item.speed || '',
        armor_desc: item.armor_desc || '',
        damage_resistances: item.damage_resistances || '',
        damage_immunities: item.damage_immunities || '',
        condition_immunities: item.condition_immunities || '',
        actions: item.actions,
        special_abilities: item.special_abilities,
        reactions: item.reactions,
        legendary_actions: item.legendary_actions,
      })
      await Monster.findByIdAndUpdate(id, {
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
          actions: translated.actions || item.actions,
          special_abilities:
            translated.special_abilities || item.special_abilities,
          reactions: translated.reactions || item.reactions,
          legendary_actions:
            translated.legendary_actions || item.legendary_actions,
        },
      })
      return NextResponse.json({ name_uk: translated.name_uk })
    }

    if (type === 'spells') {
      const item = await Spell.findById(id)
      if (!item)
        return NextResponse.json({ error: 'Не знайдено' }, { status: 404 })
      const translated = await translateSpell({
        name_en: item.name_en,
        school: item.school || '',
        casting_time: item.casting_time || '',
        range: item.range || '',
        duration: item.duration || '',
        components: item.components || '',
        description_en: item.description_en || '',
        higher_levels_en: item.higher_levels_en || '',
      })
      await Spell.findByIdAndUpdate(id, {
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
      return NextResponse.json({ name_uk: translated.name_uk })
    }

    if (type === 'races') {
      const item = await Race.findById(id)
      if (!item)
        return NextResponse.json({ error: 'Не знайдено' }, { status: 404 })
      const translated = await translateRace({
        name_en: item.name_en,
        desc: item.desc || '',
        asi_desc: item.asi_desc || '',
        age: item.age || '',
        alignment: item.alignment || '',
        size: item.size || '',
        speed_desc: item.speed_desc || '',
        languages: item.languages || '',
        vision: item.vision || '',
        traits: item.traits || '',
        subraces: (item.subraces || []).map((s: any) => ({
          name: s.name || '',
          desc: s.desc || '',
          asi_desc: s.asi_desc || '',
          traits: s.traits || '',
        })),
      })
      await Race.findByIdAndUpdate(id, {
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
        },
      })
      return NextResponse.json({ name_uk: translated.name_uk })
    }

    if (type === 'classes') {
      const item = await Class.findById(id)
      if (!item)
        return NextResponse.json({ error: 'Не знайдено' }, { status: 404 })
      const translated = await translateClass({
        name_en: item.name_en,
        desc: item.desc || '',
        hit_dice: item.hit_dice || '',
        hp_at_1st_level: item.hp_at_1st_level || '',
        hp_at_higher_levels: item.hp_at_higher_levels || '',
        prof_armor: item.prof_armor || '',
        prof_weapons: item.prof_weapons || '',
        prof_tools: item.prof_tools || '',
        prof_saving_throws: item.prof_saving_throws || '',
        prof_skills: item.prof_skills || '',
        equipment: item.equipment || '',
      })
      await Class.findByIdAndUpdate(id, {
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
      return NextResponse.json({ name_uk: translated.name_uk })
    }

    if (type === 'backgrounds') {
      const item = await Background.findById(id)
      if (!item)
        return NextResponse.json({ error: 'Не знайдено' }, { status: 404 })
      const translated = await translateBackground({
        name_en: item.name_en,
        desc: item.desc || '',
        skill_proficiencies: item.skill_proficiencies || '',
        tool_proficiencies: item.tool_proficiencies || '',
        languages: item.languages || '',
        equipment: item.equipment || '',
        feature: item.feature || '',
        feature_desc: item.feature_desc || '',
        suggested_characteristics: item.suggested_characteristics || '',
      })
      await Background.findByIdAndUpdate(id, {
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
      return NextResponse.json({ name_uk: translated.name_uk })
    }

    if (type === 'feats') {
      const item = await Feat.findById(id)
      if (!item)
        return NextResponse.json({ error: 'Не знайдено' }, { status: 404 })
      const translated = await translateFeat({
        name_en: item.name_en,
        desc: item.desc || '',
        prerequisite: item.prerequisite || '',
      })
      await Feat.findByIdAndUpdate(id, {
        $set: {
          name_uk: translated.name_uk || '',
          desc_uk: translated.desc_uk || '',
          prerequisite_uk: translated.prerequisite_uk || '',
        },
      })
      return NextResponse.json({ name_uk: translated.name_uk })
    }

    if (type === 'magic-items') {
      const item = await MagicItem.findById(id)
      if (!item)
        return NextResponse.json({ error: 'Не знайдено' }, { status: 404 })
      const translated = await translateMagicItem({
        name_en: item.name_en,
        desc: item.desc || '',
        type: item.type || '',
        rarity: item.rarity || '',
      })
      await MagicItem.findByIdAndUpdate(id, {
        $set: {
          name_uk: translated.name_uk || '',
          desc_uk: translated.desc_uk || '',
          type_uk: translated.type_uk || '',
          rarity_uk: translated.rarity_uk || '',
        },
      })
      return NextResponse.json({ name_uk: translated.name_uk })
    }

    if (type === 'conditions') {
      const item = await Condition.findById(id)
      if (!item)
        return NextResponse.json({ error: 'Не знайдено' }, { status: 404 })
      const translated = await translateCondition({
        name_en: item.name_en,
        desc_en: item.desc_en || '',
      })
      await Condition.findByIdAndUpdate(id, {
        $set: {
          name_uk: translated.name_uk || '',
          desc_uk: translated.desc_uk || '',
        },
      })
      return NextResponse.json({ name_uk: translated.name_uk })
    }

    if (type === 'equipment') {
      const item = await Equipment.findById(id)
      if (!item)
        return NextResponse.json({ error: 'Не знайдено' }, { status: 404 })
      const translated = await translateEquipment({
        name_en: item.name_en,
        desc_en: item.desc_en || '',
        damage_type: item.damage_type || '',
        properties: item.properties || [],
      })
      await Equipment.findByIdAndUpdate(id, {
        $set: {
          name_uk: translated.name_uk || '',
          desc_uk: translated.desc_uk || '',
          damage_type_uk: translated.damage_type_uk || '',
          properties_uk: translated.properties_uk || [],
        },
      })
      return NextResponse.json({ name_uk: translated.name_uk })
    }

    if (type === 'sections') {
      const item = await Section.findById(id)
      if (!item)
        return NextResponse.json({ error: 'Не знайдено' }, { status: 404 })
      const translated = await translateSection({
        name_en: item.name_en,
        desc_en: item.desc_en || '',
      })
      await Section.findByIdAndUpdate(id, {
        $set: {
          name_uk: translated.name_uk || '',
          desc_uk: translated.desc_uk || '',
        },
      })
      return NextResponse.json({ name_uk: translated.name_uk })
    }

    return NextResponse.json({ error: 'Невідомий тип' }, { status: 400 })
  } catch (error) {
    console.error('Translate-one error:', error)
    return NextResponse.json({ error: 'Помилка сервера' }, { status: 500 })
  }
}
