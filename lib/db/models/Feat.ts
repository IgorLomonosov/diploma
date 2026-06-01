import mongoose, { Schema, Document } from 'mongoose'

export interface IFeat extends Document {
  name_en: string
  name_uk: string
  slug: string
  desc: string
  desc_uk: string
  prerequisite: string
  prerequisite_uk: string
  document_slug: string
  document_title: string
  source: string
}

const FeatSchema = new Schema<IFeat>(
  {
    name_en: { type: String, required: true },
    name_uk: { type: String, default: '' },
    slug: { type: String, required: true, unique: true },
    desc: { type: String, default: '' },
    desc_uk: { type: String, default: '' },
    prerequisite: { type: String, default: '' },
    prerequisite_uk: { type: String, default: '' },
    document_slug: { type: String, default: '' },
    document_title: { type: String, default: '' },
    source: { type: String, default: 'open5e' },
  },
  { timestamps: true },
)

export default mongoose.models.Feat || mongoose.model<IFeat>('Feat', FeatSchema)
