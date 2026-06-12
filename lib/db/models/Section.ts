import mongoose, { Schema } from 'mongoose'

const SectionSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true },
    name_en: { type: String, required: true },
    name_uk: { type: String, default: '' },
    desc_en: { type: String, default: '' },
    desc_uk: { type: String, default: '' },
    parent: { type: String, default: '' },
    document_slug: { type: String, default: '' },
    document_title: { type: String, default: '' },
  },
  { timestamps: true },
)

export default mongoose.models.Section ||
  mongoose.model('Section', SectionSchema)
