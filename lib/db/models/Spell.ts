import mongoose, { Schema, Document } from 'mongoose'

export interface ISpell extends Document {
  name_en: string
  name_uk: string
  slug: string
  level: number
  school: string
  casting_time: string
  range: string
  duration: string
  components: string
  concentration: boolean
  ritual: boolean
  description_uk: string
  higher_levels_uk: string
  classes: string[]
  source: string
  description_en: string
  higher_levels_en: string
  material: string
  document_slug: string
  document_title: string
}

const SpellSchema = new Schema<ISpell>(
  {
    name_en: { type: String, required: true },
    name_uk: { type: String, default: '' },
    slug: { type: String, required: true, unique: true },
    level: { type: Number, required: true, min: 0, max: 9 },
    school: { type: String, default: '' },
    casting_time: { type: String, default: '' },
    range: { type: String, default: '' },
    duration: { type: String, default: '' },
    components: { type: String, default: '' },
    concentration: { type: Boolean, default: false },
    ritual: { type: Boolean, default: false },
    description_uk: { type: String, default: '' },
    higher_levels_uk: { type: String, default: '' },
    classes: [{ type: String }],
    source: { type: String, default: 'open5e' },
    description_en: { type: String, default: '' },
    higher_levels_en: { type: String, default: '' },
    material: { type: String, default: '' },
    document_slug: { type: String, default: '' },
    document_title: { type: String, default: '' },
  },
  { timestamps: true },
)

export default mongoose.models.Spell ||
  mongoose.model<ISpell>('Spell', SpellSchema)
