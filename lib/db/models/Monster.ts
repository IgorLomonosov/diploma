import mongoose, { Schema, Document } from 'mongoose'

export interface IMonster extends Document {
  name_en: string
  name_uk: string
  slug: string
  size: string
  type: string
  alignment: string
  armor_class: number
  armor_desc: string
  initiative_bonus: number
  hit_points: number
  hit_dice: string
  speed: string
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
  skills: string
  damage_resistances: string
  damage_immunities: string
  condition_immunities: string
  senses: string
  languages: string
  challenge_rating: string
  xp: number
  img_main: string
  description_en: string
  description_uk: string
  actions: { name: string; description: string }[]
  reactions: { name: string; description: string }[]
  special_abilities: { name: string; description: string }[]
  legendary_actions: { name: string; description: string }[]
  environments: string[]
  document_slug: string
  document_title: string
  source: string
  size_uk: string
  type_uk: string
  alignment_uk: string
  skills_uk: string
  senses_uk: string
  languages_uk: string
  speed_uk: string
  armor_desc_uk: string
  damage_resistances_uk: string
  damage_immunities_uk: string
  condition_immunities_uk: string
}

const MonsterSchema = new Schema<IMonster>(
  {
    name_en: { type: String, required: true },
    name_uk: { type: String, default: '' },
    slug: { type: String, required: true, unique: true },
    size: { type: String, default: '' },
    type: { type: String, default: '' },
    alignment: { type: String, default: '' },
    armor_class: { type: Number, default: 0 },
    armor_desc: { type: String, default: '' },
    initiative_bonus: { type: Number, default: 0 },
    hit_points: { type: Number, default: 0 },
    hit_dice: { type: String, default: '' },
    speed: { type: String, default: '' },
    strength: { type: Number, default: 10 },
    dexterity: { type: Number, default: 10 },
    constitution: { type: Number, default: 10 },
    intelligence: { type: Number, default: 10 },
    wisdom: { type: Number, default: 10 },
    charisma: { type: Number, default: 10 },
    strength_save: { type: Number, default: null },
    dexterity_save: { type: Number, default: null },
    constitution_save: { type: Number, default: null },
    intelligence_save: { type: Number, default: null },
    wisdom_save: { type: Number, default: null },
    charisma_save: { type: Number, default: null },
    skills: { type: String, default: '' },
    damage_resistances: { type: String, default: '' },
    damage_immunities: { type: String, default: '' },
    condition_immunities: { type: String, default: '' },
    senses: { type: String, default: '' },
    languages: { type: String, default: '' },
    challenge_rating: { type: String, default: '0' },
    xp: { type: Number, default: 0 },
    img_main: { type: String, default: '' },
    description_en: { type: String, default: '' },
    description_uk: { type: String, default: '' },
    actions: [{ name: String, description: String }],
    reactions: [{ name: String, description: String }],
    special_abilities: [{ name: String, description: String }],
    legendary_actions: [{ name: String, description: String }],
    environments: [{ type: String }],
    document_slug: { type: String, default: '' },
    document_title: { type: String, default: '' },
    source: { type: String, default: 'open5e' },
    size_uk: { type: String, default: '' },
    type_uk: { type: String, default: '' },
    alignment_uk: { type: String, default: '' },
    skills_uk: { type: String, default: '' },
    senses_uk: { type: String, default: '' },
    languages_uk: { type: String, default: '' },
    speed_uk: { type: String, default: '' },
    armor_desc_uk: { type: String, default: '' },
    damage_resistances_uk: { type: String, default: '' },
    damage_immunities_uk: { type: String, default: '' },
    condition_immunities_uk: { type: String, default: '' },
    img_main: { type: String, default: '' },
  },
  { timestamps: true },
)

export default mongoose.models.Monster ||
  mongoose.model<IMonster>('Monster', MonsterSchema)
