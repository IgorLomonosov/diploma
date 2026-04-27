import axios from 'axios'

const BASE_URL = 'https://api.open5e.com/v1'

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
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
