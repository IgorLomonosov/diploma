import mongoose, { Schema, Document } from 'mongoose'

export interface IMagicItem extends Document {
  name_en: string
  name_uk: string
  slug: string
  type: string
  type_uk: string
  rarity: string
  rarity_uk: string
  requires_attunement: string
  desc: string
  desc_uk: string
  document_slug: string
  document_title: string
  source: string
}

const MagicItemSchema = new Schema<IMagicItem>(
  {
    name_en: { type: String, required: true },
    name_uk: { type: String, default: '' },
    slug: { type: String, required: true, unique: true },
    type: { type: String, default: '' },
    type_uk: { type: String, default: '' },
    rarity: { type: String, default: '' },
    rarity_uk: { type: String, default: '' },
    requires_attunement: { type: String, default: '' },
    desc: { type: String, default: '' },
    desc_uk: { type: String, default: '' },
    document_slug: { type: String, default: '' },
    document_title: { type: String, default: '' },
    source: { type: String, default: 'open5e' },
  },
  { timestamps: true },
)

export default mongoose.models.MagicItem ||
  mongoose.model<IMagicItem>('MagicItem', MagicItemSchema)
