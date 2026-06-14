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
  fetchMonsters,
  fetchSpells,
  Open5eMonster,
  Open5eSpell,
  fetchRaces,
  fetchClasses,
  fetchBackgrounds,
  fetchFeats,
  fetchMagicItems,
  Open5eRace,
  Open5eClass,
  Open5eBackground,
  Open5eFeat,
  Open5eMagicItem,
  fetchConditions,
  fetchArmor,
  fetchWeapons,
  fetchSections,
} from './open5e'

export interface ScraperResult {
  success: number
  skipped: number
  errors: number
  total: number
}

function transformMonster(raw: Open5eMonster) {
  const speedStr =
    typeof raw.speed === 'object' && raw.speed !== null
      ? Object.entries(raw.speed)
          .map(([key, val]) => `${key}: ${val}`)
          .join(', ')
      : String(raw.speed || '')

  return {
    name_en: raw.name,
    slug: raw.slug,
    size: raw.size || '',
    type: raw.type || '',
    alignment: raw.alignment || '',
    armor_class: raw.armor_class || 0,
    armor_desc: raw.armor_desc || '',
    initiative_bonus:
      raw.initiative_bonus ?? Math.floor((raw.dexterity - 10) / 2),
    hit_points: raw.hit_points || 0,
    hit_dice: raw.hit_dice || '',
    speed: speedStr,
    strength: raw.strength || 10,
    dexterity: raw.dexterity || 10,
    constitution: raw.constitution || 10,
    intelligence: raw.intelligence || 10,
    wisdom: raw.wisdom || 10,
    charisma: raw.charisma || 10,
    strength_save: raw.strength_save ?? null,
    dexterity_save: raw.dexterity_save ?? null,
    constitution_save: raw.constitution_save ?? null,
    intelligence_save: raw.intelligence_save ?? null,
    wisdom_save: raw.wisdom_save ?? null,
    charisma_save: raw.charisma_save ?? null,
    skills:
      typeof raw.skills === 'object' && raw.skills !== null
        ? Object.entries(raw.skills)
            .map(([key, val]) => `${key}: +${val}`)
            .join(', ')
        : String(raw.skills || ''),
    damage_resistances:
      typeof raw.damage_resistances === 'object' &&
      raw.damage_resistances !== null
        ? Object.values(raw.damage_resistances).join(', ')
        : String(raw.damage_resistances || ''),
    damage_immunities:
      typeof raw.damage_immunities === 'object' &&
      raw.damage_immunities !== null
        ? Object.values(raw.damage_immunities).join(', ')
        : String(raw.damage_immunities || ''),
    condition_immunities:
      typeof raw.condition_immunities === 'object' &&
      raw.condition_immunities !== null
        ? Object.values(raw.condition_immunities).join(', ')
        : String(raw.condition_immunities || ''),
    senses: raw.senses || '',
    languages: raw.languages || '',
    challenge_rating: String(raw.challenge_rating || '0'),
    xp: raw.xp ?? 0,
    img_main: raw.img_main || '',
    description_en: raw.desc || '',
    actions: (raw.actions || []).map((a) => ({
      name: a.name,
      description: a.desc,
    })),
    reactions: (raw.reactions || []).map((a) => ({
      name: a.name,
      description: a.desc,
    })),
    special_abilities: (raw.special_abilities || []).map((a) => ({
      name: a.name,
      description: a.desc,
    })),
    legendary_actions: (raw.legendary_actions || []).map((a) => ({
      name: a.name,
      description: a.desc,
    })),
    environments: raw.environments || [],
    document_slug: raw.document__slug || '',
    document_title: raw.document__title || '',
    source: raw.document__slug || 'open5e',
  }
}

function transformSpell(raw: Open5eSpell) {
  return {
    name_en: raw.name,
    slug: raw.slug,
    level: raw.level_int || 0,
    school: raw.school || '',
    casting_time: raw.casting_time || '',
    range: raw.range || '',
    duration: raw.duration || '',
    components: raw.components || '',
    material: raw.material || '',
    concentration: raw.concentration === 'yes',
    ritual: raw.ritual === 'yes',
    description_en: raw.desc || '',
    higher_levels_en: raw.higher_level || '',
    classes: raw.dnd_class ? raw.dnd_class.split(',').map((c) => c.trim()) : [],
    document_slug: raw.document__slug || '',
    document_title: raw.document__title || '',
    source: raw.document__slug || 'open5e',
  }
}

function transformRace(raw: Open5eRace) {
  const speedVal =
    typeof raw.speed === 'object' && raw.speed !== null
      ? (Object.values(raw.speed as Record<string, number>)[0] ?? 30)
      : (raw.speed as number) || 30

  return {
    name_en: raw.name,
    slug: raw.slug,
    desc: raw.desc || '',
    asi_desc: raw.asi_desc || '',
    size: raw.size || '',
    size_raw: raw.size_raw || '',
    speed: speedVal,
    speed_desc: raw.speed_desc || '',
    ability_score_increases: raw.asi_desc || '',
    age: raw.age || '',
    alignment: raw.alignment || '',
    languages: raw.languages || '',
    vision: raw.vision || '',
    traits: typeof raw.traits === 'string' ? raw.traits : '',
    subraces: (raw.subraces || []).map((s) => ({
      name: s.name,
      desc: s.desc || '',
      asi_desc: s.asi_desc || '',
      traits: s.traits || '',
    })),
    document_slug: raw.document__slug || '',
    document_title: raw.document__title || '',
    source: raw.document__slug || 'open5e',
  }
}

function transformClass(raw: Open5eClass) {
  return {
    name_en: raw.name,
    slug: raw.slug,
    hit_dice: raw.hit_dice || '',
    hp_at_1st_level: raw.hp_at_1st_level || '',
    hp_at_higher_levels: raw.hp_at_higher_levels || '',
    prof_armor: raw.prof_armor || '',
    prof_weapons: raw.prof_weapons || '',
    prof_tools: raw.prof_tools || '',
    prof_saving_throws: raw.prof_saving_throws || '',
    prof_skills: raw.prof_skills || '',
    equipment: raw.equipment || '',
    desc: raw.desc || '',
    spell_casting_ability: raw.spell_casting_ability || '',
    subtypes_name: raw.subtypes_name || '',
    document_slug: raw.document__slug || '',
    document_title: raw.document__title || '',
    source: raw.document__slug || 'open5e',
  }
}

function transformBackground(raw: Open5eBackground) {
  return {
    name_en: raw.name,
    slug: raw.slug,
    desc: raw.desc || '',
    skill_proficiencies: raw.skill_proficiencies || '',
    tool_proficiencies: raw.tool_proficiencies || '',
    languages: raw.languages || '',
    equipment: raw.equipment || '',
    feature: raw.feature || '',
    feature_desc: raw.feature_desc || '',
    suggested_characteristics: raw.suggested_characteristics || '',
    document_slug: raw.document__slug || '',
    document_title: raw.document__title || '',
    source: raw.document__slug || 'open5e',
  }
}

function transformFeat(raw: Open5eFeat) {
  const effectsText = Array.isArray((raw as any).effects_desc)
    ? '\n\n' +
      ((raw as any).effects_desc as string[]).map((e) => `- ${e}`).join('\n')
    : ''
  return {
    name_en: raw.name,
    slug: raw.slug,
    desc: (raw.desc || '') + effectsText,
    prerequisite: raw.prerequisite || '',
    document_slug: raw.document__slug || '',
    document_title: raw.document__title || '',
    source: raw.document__slug || 'open5e',
  }
}

function transformMagicItem(raw: Open5eMagicItem) {
  return {
    name_en: raw.name,
    slug: raw.slug,
    type: raw.type || '',
    rarity: raw.rarity || '',
    requires_attunement: raw.requires_attunement || '',
    desc: raw.desc || '',
    document_slug: raw.document__slug || '',
    document_title: raw.document__title || '',
    source: raw.document__slug || 'open5e',
  }
}

export async function scrapeMonsters(
  maxPages = 5,
  document = '',
): Promise<ScraperResult> {
  await connectDB()
  const result: ScraperResult = { success: 0, skipped: 0, errors: 0, total: 0 }

  for (let page = 1; page <= maxPages; page++) {
    try {
      console.log(`Scraping monsters page ${page}/${maxPages}...`)
      const data = await fetchMonsters(page, 20, document)
      if (!data.results || data.results.length === 0) break
      result.total += data.results.length

      for (const raw of data.results) {
        try {
          const monster = transformMonster(raw as Open5eMonster)
          await Monster.findOneAndUpdate(
            { slug: monster.slug },
            {
              $set: monster,
              $setOnInsert: {
                name_uk: '',
                description_uk: '',
                size_uk: '',
                type_uk: '',
                alignment_uk: '',
                skills_uk: '',
                senses_uk: '',
                languages_uk: '',
                speed_uk: '',
                armor_desc_uk: '',
                damage_resistances_uk: '',
                damage_immunities_uk: '',
                condition_immunities_uk: '',
              },
            },
            { upsert: true, new: true },
          )
          result.success++
        } catch (err) {
          console.error(`Error saving monster ${raw.slug}:`, err)
          result.errors++
        }
      }

      if (!data.next) break
      await new Promise((r) => setTimeout(r, 500))
    } catch (err) {
      console.error(`Error fetching monsters page ${page}:`, err)
      result.errors++
      break
    }
  }
  return result
}

export async function scrapeSpells(
  maxPages = 5,
  document = '',
): Promise<ScraperResult> {
  await connectDB()
  const result: ScraperResult = { success: 0, skipped: 0, errors: 0, total: 0 }

  for (let page = 1; page <= maxPages; page++) {
    try {
      console.log(`Scraping spells page ${page}/${maxPages}...`)
      const data = await fetchSpells(page, 20, document)
      if (!data.results || data.results.length === 0) break
      result.total += data.results.length

      for (const raw of data.results) {
        try {
          const spell = transformSpell(raw as Open5eSpell)
          await Spell.findOneAndUpdate(
            { slug: spell.slug },
            {
              $set: spell,
              $setOnInsert: {
                name_uk: '',
                school_uk: '',
                casting_time_uk: '',
                range_uk: '',
                duration_uk: '',
                components_uk: '',
                description_uk: '',
                higher_levels_uk: '',
              },
            },
            { upsert: true, new: true },
          )
          result.success++
        } catch (err) {
          console.error(`Error saving spell ${raw.slug}:`, err)
          result.errors++
        }
      }

      if (!data.next) break
      await new Promise((r) => setTimeout(r, 500))
    } catch (err) {
      console.error(`Error fetching spells page ${page}:`, err)
      result.errors++
      break
    }
  }
  return result
}

export async function scrapeRaces(
  maxPages = 5,
  document = '',
): Promise<ScraperResult> {
  await connectDB()
  const result: ScraperResult = { success: 0, skipped: 0, errors: 0, total: 0 }

  for (let page = 1; page <= maxPages; page++) {
    try {
      const data = await fetchRaces(page, 20, document)
      if (!data.results || data.results.length === 0) break
      result.total += data.results.length

      for (const raw of data.results) {
        try {
          const race = transformRace(raw as Open5eRace)
          await Race.findOneAndUpdate(
            { slug: race.slug },
            {
              $set: race,
              $setOnInsert: {
                name_uk: '',
                desc_uk: '',
                asi_desc_uk: '',
                age_uk: '',
                alignment_uk: '',
                size_uk: '',
                speed_desc_uk: '',
                languages_uk: '',
                vision_uk: '',
                traits_uk: '',
              },
            },
            { upsert: true, new: true },
          )
          result.success++
        } catch (err) {
          console.error(`Error saving race ${raw.slug}:`, err)
          result.errors++
        }
      }

      if (!data.next) break
      await new Promise((r) => setTimeout(r, 500))
    } catch (err) {
      console.error(`Error fetching races page ${page}:`, err)
      result.errors++
      break
    }
  }
  return result
}

export async function scrapeClasses(
  maxPages = 5,
  document = '',
): Promise<ScraperResult> {
  await connectDB()
  const result: ScraperResult = { success: 0, skipped: 0, errors: 0, total: 0 }

  for (let page = 1; page <= maxPages; page++) {
    try {
      const data = await fetchClasses(page, 20, document)
      if (!data.results || data.results.length === 0) break
      result.total += data.results.length

      for (const raw of data.results) {
        try {
          const cls = transformClass(raw as Open5eClass)
          await Class.findOneAndUpdate(
            { slug: cls.slug },
            {
              $set: cls,
              $setOnInsert: {
                name_uk: '',
                desc_uk: '',
                hp_at_1st_level_uk: '',
                hp_at_higher_levels_uk: '',
                prof_armor_uk: '',
                prof_weapons_uk: '',
                prof_tools_uk: '',
                prof_saving_throws_uk: '',
                prof_skills_uk: '',
                equipment_uk: '',
              },
            },
            { upsert: true, new: true },
          )
          result.success++
        } catch (err) {
          console.error(`Error saving class ${raw.slug}:`, err)
          result.errors++
        }
      }

      if (!data.next) break
      await new Promise((r) => setTimeout(r, 500))
    } catch (err) {
      console.error(`Error fetching classes page ${page}:`, err)
      result.errors++
      break
    }
  }
  return result
}

export async function scrapeBackgrounds(
  maxPages = 5,
  document = '',
): Promise<ScraperResult> {
  await connectDB()
  const result: ScraperResult = { success: 0, skipped: 0, errors: 0, total: 0 }

  for (let page = 1; page <= maxPages; page++) {
    try {
      const data = await fetchBackgrounds(page, 20, document)
      if (!data.results || data.results.length === 0) break
      result.total += data.results.length

      for (const raw of data.results) {
        try {
          const bg = transformBackground(raw as Open5eBackground)
          await Background.findOneAndUpdate(
            { slug: bg.slug },
            {
              $set: bg,
              $setOnInsert: {
                name_uk: '',
                desc_uk: '',
                skill_proficiencies_uk: '',
                tool_proficiencies_uk: '',
                languages_uk: '',
                equipment_uk: '',
                feature_uk: '',
                feature_desc_uk: '',
                suggested_characteristics_uk: '',
              },
            },
            { upsert: true, new: true },
          )
          result.success++
        } catch (err) {
          console.error(`Error saving background ${raw.slug}:`, err)
          result.errors++
        }
      }

      if (!data.next) break
      await new Promise((r) => setTimeout(r, 500))
    } catch (err) {
      console.error(`Error fetching backgrounds page ${page}:`, err)
      result.errors++
      break
    }
  }
  return result
}

export async function scrapeFeats(
  maxPages = 5,
  document = '',
): Promise<ScraperResult> {
  await connectDB()
  const result: ScraperResult = { success: 0, skipped: 0, errors: 0, total: 0 }

  for (let page = 1; page <= maxPages; page++) {
    try {
      const data = await fetchFeats(page, 20, document)
      if (!data.results || data.results.length === 0) break
      result.total += data.results.length

      for (const raw of data.results) {
        try {
          const feat = transformFeat(raw as Open5eFeat)
          await Feat.findOneAndUpdate(
            { slug: feat.slug },
            {
              $set: feat,
              $setOnInsert: {
                name_uk: '',
                desc_uk: '',
                prerequisite_uk: '',
              },
            },
            { upsert: true, new: true },
          )
          result.success++
        } catch (err) {
          console.error(`Error saving feat ${raw.slug}:`, err)
          result.errors++
        }
      }

      if (!data.next) break
      await new Promise((r) => setTimeout(r, 500))
    } catch (err) {
      console.error(`Error fetching feats page ${page}:`, err)
      result.errors++
      break
    }
  }
  return result
}

export async function scrapeMagicItems(
  maxPages = 5,
  document = '',
): Promise<ScraperResult> {
  await connectDB()
  const result: ScraperResult = { success: 0, skipped: 0, errors: 0, total: 0 }

  for (let page = 1; page <= maxPages; page++) {
    try {
      const data = await fetchMagicItems(page, 20, document)
      if (!data.results || data.results.length === 0) break
      result.total += data.results.length

      for (const raw of data.results) {
        try {
          const item = transformMagicItem(raw as Open5eMagicItem)
          await MagicItem.findOneAndUpdate(
            { slug: item.slug },
            {
              $set: item,
              $setOnInsert: {
                name_uk: '',
                type_uk: '',
                rarity_uk: '',
                desc_uk: '',
              },
            },
            { upsert: true, new: true },
          )
          result.success++
        } catch (err) {
          console.error(`Error saving magic item ${raw.slug}:`, err)
          result.errors++
        }
      }

      if (!data.next) break
      await new Promise((r) => setTimeout(r, 500))
    } catch (err) {
      console.error(`Error fetching magic items page ${page}:`, err)
      result.errors++
      break
    }
  }
  return result
}

export async function scrapeConditions() {
  await connectDB()
  const data = await fetchConditions(100, 1)
  const items = data.results || []
  let upserted = 0

  for (const raw of items) {
    await Condition.findOneAndUpdate(
      { slug: raw.slug },
      {
        $set: {
          slug: raw.slug,
          name_en: raw.name,
          desc_en: raw.desc || '',
          document_slug: raw.document__slug || '',
          document_title: raw.document__title || '',
        },
        $setOnInsert: { name_uk: '', desc_uk: '' },
      },
      { upsert: true, new: true },
    )
    upserted++
  }

  return { upserted, total: items.length }
}

export async function scrapeEquipment() {
  await connectDB()
  let upserted = 0

  const weaponsData = await fetchWeapons(100, 1)
  for (const raw of weaponsData.results || []) {
    await Equipment.findOneAndUpdate(
      { slug: raw.slug },
      {
        $set: {
          slug: raw.slug,
          name_en: raw.name,
          category: 'weapon',
          cost: raw.cost || '',
          weight: raw.weight || '',
          desc_en: raw.desc || '',
          damage_dice: raw.damage_dice || '',
          damage_type: raw.damage_type || '',
          properties: raw.properties || [],
          weapon_range: raw.weapon_range || '',
          document_slug: raw.document__slug || '',
          document_title: raw.document__title || '',
        },
        $setOnInsert: {
          name_uk: '',
          desc_uk: '',
          damage_type_uk: '',
          properties_uk: [],
        },
      },
      { upsert: true, new: true },
    )
    upserted++
  }

  const armorData = await fetchArmor(100, 1)
  for (const raw of armorData.results || []) {
    await Equipment.findOneAndUpdate(
      { slug: `armor-${raw.slug}` },
      {
        $set: {
          slug: `armor-${raw.slug}`,
          name_en: raw.name,
          category: 'armor',
          cost: raw.cost || '',
          weight: raw.weight || '',
          desc_en: raw.desc || '',
          armor_class: raw.ac_string || '',
          armor_category: raw.armor_category || '',
          strength_requirement: raw.strength_requirement || 0,
          stealth_disadvantage: raw.stealth_disadvantage || false,
          document_slug: raw.document__slug || '',
          document_title: raw.document__title || '',
        },
        $setOnInsert: { name_uk: '', desc_uk: '' },
      },
      { upsert: true, new: true },
    )
    upserted++
  }

  return { upserted }
}

export async function scrapeSections(maxPages = 5) {
  await connectDB()
  let upserted = 0

  for (let page = 1; page <= maxPages; page++) {
    const data = await fetchSections(100, page)
    const results = data.results || []
    if (!results.length) break

    for (const raw of results) {
      await Section.findOneAndUpdate(
        { slug: raw.slug },
        {
          $set: {
            slug: raw.slug,
            name_en: raw.name,
            desc_en: raw.desc || '',
            parent: raw.parent || '',
            document_slug: raw.document__slug || '',
            document_title: raw.document__title || '',
          },
          $setOnInsert: { name_uk: '', desc_uk: '' },
        },
        { upsert: true, new: true },
      )
      upserted++
    }

    if (!data.next) break
  }

  return { upserted }
}
