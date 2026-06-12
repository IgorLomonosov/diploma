import axios from 'axios'

const BASE_URL = 'https://api.open5e.com/v1'

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
})

export interface Open5eMonster {
  slug: string
  name: string
  size: string
  type: string
  alignment: string
  armor_class: number
  armor_desc: string
  initiative_bonus: number
  hit_points: number
  hit_dice: string
  speed: string | Record<string, number>
  strength: number
  dexterity: number
  constitution: number
  intelligence: number
  wisdom: number
  charisma: number
  strength_save: number | null
  dexterity_save: number | null
  constitution_save: number | null
  intelligence_save: number | null
  wisdom_save: number | null
  charisma_save: number | null
  skills: string | Record<string, number>
  damage_resistances: string | Record<string, string>
  damage_immunities: string | Record<string, string>
  condition_immunities: string | Record<string, string>
  senses: string
  languages: string
  challenge_rating: string
  xp: number
  img_main: string
  actions: { name: string; desc: string }[]
  reactions: { name: string; desc: string }[]
  special_abilities: { name: string; desc: string }[]
  legendary_actions: { name: string; desc: string }[]
  environments: string[]
  desc: string
  document__slug: string
  document__title: string
}

export interface Open5eSpell {
  slug: string
  name: string
  level_int: number
  school: string
  casting_time: string
  range: string
  duration: string
  components: string
  concentration: string
  ritual: string
  desc: string
  higher_level: string
  material: string
  dnd_class: string
  document__slug: string
  document__title: string
}

export interface Open5eRace {
  slug: string
  name: string
  desc: string
  asi_desc: string
  asi: { attributes: string[]; value: number }[]
  age: string
  alignment: string
  size: string
  size_raw: string
  speed: number | Record<string, number>
  speed_desc: string
  languages: string
  vision: string
  traits: string
  subraces: {
    name: string
    slug: string
    desc: string
    asi_desc: string
    traits: string
  }[]
  document__slug: string
  document__title: string
}

export interface Open5eClass {
  slug: string
  name: string
  hit_dice: string
  hp_at_1st_level: string
  hp_at_higher_levels: string
  prof_armor: string
  prof_weapons: string
  prof_tools: string
  prof_saving_throws: string
  prof_skills: string
  equipment: string
  desc: string
  spell_casting_ability: string
  subtypes_name: string
  document__slug: string
  document__title: string
}

export interface Open5eBackground {
  slug: string
  name: string
  desc: string
  skill_proficiencies: string
  tool_proficiencies: string
  languages: string
  equipment: string
  feature: string
  feature_desc: string
  suggested_characteristics: string
  document__slug: string
  document__title: string
}

export interface Open5eFeat {
  slug: string
  name: string
  desc: string
  effects_desc?: string[]
  prerequisite: string
  document__slug: string
  document__title: string
}

export interface Open5eMagicItem {
  slug: string
  name: string
  type: string
  rarity: string
  requires_attunement: string
  desc: string
  document__slug: string
  document__title: string
}

export async function fetchMonsters(page = 1, limit = 20, document = '') {
  const params: Record<string, unknown> = { limit, page }
  if (document) params.document__slug = document

  const res = await client.get('/monsters/', { params })
  return res.data
}

export async function fetchMonsterBySlug(slug: string) {
  const res = await client.get(`/monsters/${slug}/`)
  return res.data as Open5eMonster
}

export async function fetchSpells(page = 1, limit = 20, document = '') {
  const params: Record<string, unknown> = { limit, page }
  if (document) params.document__slug = document

  const res = await client.get('/spells/', { params })
  return res.data
}

export async function fetchSpellBySlug(slug: string) {
  const res = await client.get(`/spells/${slug}/`)
  return res.data as Open5eSpell
}

export async function fetchRaces(page = 1, limit = 20, document = '') {
  const params: Record<string, unknown> = { limit, page }
  if (document) params.document__slug = document
  const res = await client.get('/races/', { params })
  return res.data
}

export async function fetchClasses(page = 1, limit = 20, document = '') {
  const params: Record<string, unknown> = { limit, page }
  if (document) params.document__slug = document
  const res = await client.get('/classes/', { params })
  return res.data
}

export async function fetchBackgrounds(page = 1, limit = 20, document = '') {
  const params: Record<string, unknown> = { limit, page }
  if (document) params.document__slug = document
  const res = await client.get('/backgrounds/', { params })
  return res.data
}

export async function fetchFeats(page = 1, limit = 20, document = '') {
  const params: Record<string, unknown> = { limit, page }
  if (document) params.document__slug = document
  const res = await client.get('/feats/', { params })
  return res.data
}

export async function fetchMagicItems(page = 1, limit = 20, document = '') {
  const params: Record<string, unknown> = { limit, page }
  if (document) params.document__slug = document
  const res = await client.get('/magicitems/', { params })
  return res.data
}

export interface Open5eCondition {
  slug: string
  name: string
  desc: string
  document__slug: string
  document__title: string
}

export async function fetchConditions(limit = 100, page = 1) {
  const res = await client.get('/conditions/', { params: { limit, page } })
  return res.data
}

export interface Open5eWeapon {
  slug: string
  name: string
  desc: string
  cost: string
  weight: string
  damage_dice: string
  damage_type: string
  properties: string[]
  weapon_range: string
  category_range: string
  document__slug: string
  document__title: string
}

export interface Open5eArmor {
  slug: string
  name: string
  desc: string
  cost: string
  weight: string
  ac_string: string
  armor_category: string
  strength_requirement: number
  stealth_disadvantage: boolean
  document__slug: string
  document__title: string
}

export async function fetchWeapons(limit = 100, page = 1) {
  const res = await client.get('/weapons/', { params: { limit, page } })
  return res.data
}

export async function fetchArmor(limit = 100, page = 1) {
  const res = await client.get('/armor/', { params: { limit, page } })
  return res.data
}

export async function fetchSections(limit = 100, page = 1) {
  const res = await client.get('/sections/', { params: { limit, page } })
  return res.data
}
