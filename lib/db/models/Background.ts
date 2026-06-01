import mongoose, { Schema, Document } from 'mongoose'

export interface IBackground extends Document {
  name_en: string
  name_uk: string
  slug: string
  desc: string
  desc_uk: string
  skill_proficiencies: string
  skill_proficiencies_uk: string
  tool_proficiencies: string
  tool_proficiencies_uk: string
  languages: string
  languages_uk: string
  equipment: string
  equipment_uk: string
  feature: string
  feature_uk: string
  feature_desc: string
  feature_desc_uk: string
  suggested_characteristics: string
  suggested_characteristics_uk: string
  document_slug: string
  document_title: string
  source: string
}

const BackgroundSchema = new Schema<IBackground>(
  {
    name_en: { type: String, required: true },
    name_uk: { type: String, default: '' },
    slug: { type: String, required: true, unique: true },
    desc: { type: String, default: '' },
    desc_uk: { type: String, default: '' },
    skill_proficiencies: { type: String, default: '' },
    skill_proficiencies_uk: { type: String, default: '' },
    tool_proficiencies: { type: String, default: '' },
    tool_proficiencies_uk: { type: String, default: '' },
    languages: { type: String, default: '' },
    languages_uk: { type: String, default: '' },
    equipment: { type: String, default: '' },
    equipment_uk: { type: String, default: '' },
    feature: { type: String, default: '' },
    feature_uk: { type: String, default: '' },
    feature_desc: { type: String, default: '' },
    feature_desc_uk: { type: String, default: '' },
    suggested_characteristics: { type: String, default: '' },
    suggested_characteristics_uk: { type: String, default: '' },
    document_slug: { type: String, default: '' },
    document_title: { type: String, default: '' },
    source: { type: String, default: 'open5e' },
  },
  { timestamps: true },
)

export default mongoose.models.Background ||
  mongoose.model<IBackground>('Background', BackgroundSchema)
