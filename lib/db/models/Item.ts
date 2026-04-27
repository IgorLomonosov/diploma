import mongoose, { Schema, Document } from 'mongoose'

export interface IItem extends Document {
  name_en: string
  name_uk: string
  slug: string
  type: string
  rarity: string
  requires_attunement: boolean
  description_uk: string
  properties: string[]
  source: string
}

const ItemSchema = new Schema<IItem>(
  {
    name_en: { type: String, required: true },
    name_uk: { type: String, default: '' },
    slug: { type: String, required: true, unique: true },
    type: { type: String, default: '' },
    rarity: {
      type: String,
      enum: [
        'common',
        'uncommon',
        'rare',
        'very rare',
        'legendary',
        'artifact',
      ],
      default: 'common',
    },
    requires_attunement: { type: Boolean, default: false },
    description_uk: { type: String, default: '' },
    properties: [{ type: String }],
    source: { type: String, default: 'open5e' },
  },
  { timestamps: true },
)

export default mongoose.models.Item || mongoose.model<IItem>('Item', ItemSchema)
