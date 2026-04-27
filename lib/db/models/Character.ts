import mongoose, { Schema, Document } from 'mongoose'

export interface ICharacter extends Document {
  user_id: mongoose.Types.ObjectId
  name: string
  race: string
  class: string
  level: number
  background: string
  alignment: string
  experience_points: number
  strength: number
  dexterity: number
  constitution: number
  intelligence: number
  wisdom: number
  charisma: number
  max_hit_points: number
  current_hit_points: number
  armor_class: number
  speed: number
  inspiration: boolean
  proficiency_bonus: number
  skills: {
    name: string
    proficient: boolean
    expertise: boolean
  }[]
  inventory: {
    name: string
    quantity: number
    description: string
  }[]
  spells: mongoose.Types.ObjectId[]
  notes: string
}

const CharacterSchema = new Schema<ICharacter>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: { type: String, required: true },
    race: { type: String, default: '' },
    class: { type: String, default: '' },
    level: { type: Number, default: 1, min: 1, max: 20 },
    background: { type: String, default: '' },
    alignment: { type: String, default: '' },
    experience_points: { type: Number, default: 0 },
    strength: { type: Number, default: 10 },
    dexterity: { type: Number, default: 10 },
    constitution: { type: Number, default: 10 },
    intelligence: { type: Number, default: 10 },
    wisdom: { type: Number, default: 10 },
    charisma: { type: Number, default: 10 },
    max_hit_points: { type: Number, default: 0 },
    current_hit_points: { type: Number, default: 0 },
    armor_class: { type: Number, default: 10 },
    speed: { type: Number, default: 30 },
    inspiration: { type: Boolean, default: false },
    proficiency_bonus: { type: Number, default: 2 },
    skills: [
      {
        name: String,
        proficient: { type: Boolean, default: false },
        expertise: { type: Boolean, default: false },
      },
    ],
    inventory: [
      {
        name: String,
        quantity: { type: Number, default: 1 },
        description: { type: String, default: '' },
      },
    ],
    spells: [{ type: Schema.Types.ObjectId, ref: 'Spell' }],
    notes: { type: String, default: '' },
  },
  { timestamps: true },
)

export default mongoose.models.Character ||
  mongoose.model<ICharacter>('Character', CharacterSchema)
