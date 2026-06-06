import mongoose, { Schema, Document } from 'mongoose'

export interface IRace extends Document {
  name_en: string
  name_uk: string
  slug: string
  desc: string
  desc_uk: string
  asi_desc: string
  asi_desc_uk: string
  size: string
  size_raw: string
  size_uk: string
  size_description: string
  size_description_uk: string
  speed: number
  speed_desc: string
  speed_desc_uk: string
  ability_score_increases: string
  age: string
  age_uk: string
  alignment: string
  alignment_uk: string
  languages: string
  languages_uk: string
  vision: string
  vision_uk: string
  traits: string
  traits_uk: string
  subraces: {
    name: string
    name_uk: string
    desc: string
    desc_uk: string
    asi_desc: string
    asi_desc_uk: string
    traits: string
    traits_uk: string
  }[]
  document_slug: string
  document_title: string
  source: string
}

const RaceSchema = new Schema<IRace>(
  {
    name_en: { type: String, required: true },
    name_uk: { type: String, default: '' },
    slug: { type: String, required: true, unique: true },
    desc: { type: String, default: '' },
    desc_uk: { type: String, default: '' },
    asi_desc: { type: String, default: '' },
    asi_desc_uk: { type: String, default: '' },
    size: { type: String, default: '' },
    size_raw: { type: String, default: '' },
    size_uk: { type: String, default: '' },
    size_description: { type: String, default: '' },
    size_description_uk: { type: String, default: '' },
    speed: { type: Number, default: 30 },
    speed_desc: { type: String, default: '' },
    speed_desc_uk: { type: String, default: '' },
    ability_score_increases: { type: String, default: '' },
    age: { type: String, default: '' },
    age_uk: { type: String, default: '' },
    alignment: { type: String, default: '' },
    alignment_uk: { type: String, default: '' },
    languages: { type: String, default: '' },
    languages_uk: { type: String, default: '' },
    vision: { type: String, default: '' },
    vision_uk: { type: String, default: '' },
    traits: { type: String, default: '' },
    traits_uk: { type: String, default: '' },
    subraces: [
      {
        name: { type: String, default: '' },
        name_uk: { type: String, default: '' },
        desc: { type: String, default: '' },
        desc_uk: { type: String, default: '' },
        asi_desc: { type: String, default: '' },
        asi_desc_uk: { type: String, default: '' },
        traits: { type: String, default: '' },
        traits_uk: { type: String, default: '' },
      },
    ],
    document_slug: { type: String, default: '' },
    document_title: { type: String, default: '' },
    source: { type: String, default: 'open5e' },
  },
  { timestamps: true },
)

export default mongoose.models.Race || mongoose.model<IRace>('Race', RaceSchema)
