import connectDB from '@/lib/db/mongoose'
import Monster from '@/lib/db/models/Monster'
import Spell from '@/lib/db/models/Spell'
import {
  fetchMonsters,
  fetchSpells,
  Open5eMonster,
  Open5eSpell,
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
