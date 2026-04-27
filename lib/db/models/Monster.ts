import mongoose, { Schema, Document } from 'mongoose'

export interface IMonster extends Document {
  name_en: string
  name_uk: string
  slug: string
  size: string
  type: string
  alignment: string
  armor_class: number
  hit_points: number
  hit_dice: string
  speed: string
  strength: number
  dexterity: number
  constitution: number
  intelligence: number
  wisdom: number
  charisma: number
  challenge_rating: string
  description_uk: string
  actions: { name: string; description: string }[]
  special_abilities: { name: string; description: string }[]
  source: string
  createdAt: Date
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
    hit_points: { type: Number, default: 0 },
    hit_dice: { type: String, default: '' },
    speed: { type: String, default: '' },
    strength: { type: Number, default: 10 },
    dexterity: { type: Number, default: 10 },
    constitution: { type: Number, default: 10 },
    intelligence: { type: Number, default: 10 },
    wisdom: { type: Number, default: 10 },
    charisma: { type: Number, default: 10 },
    challenge_rating: { type: String, default: '0' },
    description_uk: { type: String, default: '' },
    actions: [{ name: String, description: String }],
    special_abilities: [{ name: String, description: String }],
    source: { type: String, default: 'open5e' },
  },
  { timestamps: true },
)

export default mongoose.models.Monster ||
  mongoose.model<IMonster>('Monster', MonsterSchema)
