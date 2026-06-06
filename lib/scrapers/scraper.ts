import connectDB from '@/lib/db/mongoose'
import Monster from '@/lib/db/models/Monster'
import Spell from '@/lib/db/models/Spell'
import Race from '@/lib/db/models/Race'
import Class from '@/lib/db/models/Class'
import Background from '@/lib/db/models/Background'
import Feat from '@/lib/db/models/Feat'
import MagicItem from '@/lib/db/models/MagicItem'
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
} from './open5e'

export interface ScraperResult {
  success: number
  skipped: number
  errors: number
  total: number
}

// Перетворення монстра з Open5e формату в наш формат
function transformMonster(raw: Open5eMonster) {
  const speedStr =
    typeof raw.speed === 'object' && raw.speed !== null
      ? Object.entries(raw.speed)
          .map(([key, val]) => `${key}: ${val}`)
          .join(', ')
      : String(raw.speed || '')

  return {
    name_en: raw.name,
    name_uk: '',
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
    description_uk: '',
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

// Перетворення заклинання з Open5e формату в наш формат
function transformSpell(raw: Open5eSpell) {
  return {
    name_en: raw.name,
    name_uk: '',
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
    description_uk: '',
    higher_levels_uk: '',
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
    name_uk: '',
    slug: raw.slug,
    desc: raw.desc || '',
    desc_uk: '',
    asi_desc: raw.asi_desc || '',
    asi_desc_uk: '',
    size: raw.size || '',
    size_raw: raw.size_raw || '',
    size_uk: '',
    size_description: '',
    size_description_uk: '',
    speed: speedVal,
    speed_desc: raw.speed_desc || '',
    speed_desc_uk: '',
    ability_score_increases: raw.asi_desc || '',
    age: raw.age || '',
    age_uk: '',
    alignment: raw.alignment || '',
    alignment_uk: '',
    languages: raw.languages || '',
    languages_uk: '',
    vision: raw.vision || '',
    traits: typeof raw.traits === 'string' ? raw.traits : '',
    traits_uk: '',
    subraces: (raw.subraces || []).map((s) => ({
      name: s.name,
      name_uk: '',
      desc: s.desc || '',
      desc_uk: '',
      asi_desc: s.asi_desc || '',
      asi_desc_uk: '',
      traits: s.traits || '',
      traits_uk: '',
    })),
    document_slug: raw.document__slug || '',
    document_title: raw.document__title || '',
    source: raw.document__slug || 'open5e',
  }
}

function transformClass(raw: Open5eClass) {
  return {
    name_en: raw.name,
    name_uk: '',
    slug: raw.slug,
    hit_dice: raw.hit_dice || '',
    hp_at_1st_level: raw.hp_at_1st_level || '',
    hp_at_1st_level_uk: '',
    hp_at_higher_levels: raw.hp_at_higher_levels || '',
    hp_at_higher_levels_uk: '',
    prof_armor: raw.prof_armor || '',
    prof_armor_uk: '',
    prof_weapons: raw.prof_weapons || '',
    prof_weapons_uk: '',
    prof_tools: raw.prof_tools || '',
    prof_tools_uk: '',
    prof_saving_throws: raw.prof_saving_throws || '',
    prof_saving_throws_uk: '',
    prof_skills: raw.prof_skills || '',
    prof_skills_uk: '',
    equipment: raw.equipment || '',
    equipment_uk: '',
    desc: raw.desc || '',
    desc_uk: '',
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
    name_uk: '',
    slug: raw.slug,
    desc: raw.desc || '',
    desc_uk: '',
    skill_proficiencies: raw.skill_proficiencies || '',
    skill_proficiencies_uk: '',
    tool_proficiencies: raw.tool_proficiencies || '',
    tool_proficiencies_uk: '',
    languages: raw.languages || '',
    languages_uk: '',
    equipment: raw.equipment || '',
    equipment_uk: '',
    feature: raw.feature || '',
    feature_uk: '',
    feature_desc: raw.feature_desc || '',
    feature_desc_uk: '',
    suggested_characteristics: raw.suggested_characteristics || '',
    suggested_characteristics_uk: '',
    document_slug: raw.document__slug || '',
    document_title: raw.document__title || '',
    source: raw.document__slug || 'open5e',
  }
}

function transformFeat(raw: Open5eFeat) {
  return {
    name_en: raw.name,
    name_uk: '',
    slug: raw.slug,
    desc: raw.desc || '',
    desc_uk: '',
    prerequisite: raw.prerequisite || '',
    prerequisite_uk: '',
    document_slug: raw.document__slug || '',
    document_title: raw.document__title || '',
    source: raw.document__slug || 'open5e',
  }
}

function transformMagicItem(raw: Open5eMagicItem) {
  return {
    name_en: raw.name,
    name_uk: '',
    slug: raw.slug,
    type: raw.type || '',
    type_uk: '',
    rarity: raw.rarity || '',
    rarity_uk: '',
    requires_attunement: raw.requires_attunement || '',
    desc: raw.desc || '',
    desc_uk: '',
    document_slug: raw.document__slug || '',
    document_title: raw.document__title || '',
    source: raw.document__slug || 'open5e',
  }
}

// Скрапінг монстрів
export async function scrapeMonsters(
  maxPages = 5,
  document = '',
): Promise<ScraperResult> {
  await connectDB()

  const result: ScraperResult = {
    success: 0,
    skipped: 0,
    errors: 0,
    total: 0,
  }

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
            { $set: monster },
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

// Скрапінг заклинань
export async function scrapeSpells(
  maxPages = 5,
  document = '',
): Promise<ScraperResult> {
  await connectDB()

  const result: ScraperResult = {
    success: 0,
    skipped: 0,
    errors: 0,
    total: 0,
  }

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
            { $set: spell },
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
            { $set: race },
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
            { $set: cls },
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
            { $set: bg },
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
            { $set: feat },
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
            { $set: item },
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
