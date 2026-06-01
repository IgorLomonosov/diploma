import mongoose, { Schema, Document } from 'mongoose'

export interface IClass extends Document {
  name_en: string
  name_uk: string
  slug: string
  hit_dice: string
  hp_at_1st_level: string
  hp_at_1st_level_uk: string
  hp_at_higher_levels: string
  hp_at_higher_levels_uk: string
  prof_armor: string
  prof_armor_uk: string
  prof_weapons: string
  prof_weapons_uk: string
  prof_tools: string
  prof_tools_uk: string
  prof_saving_throws: string
  prof_saving_throws_uk: string
  prof_skills: string
  prof_skills_uk: string
  equipment: string
  equipment_uk: string
  desc: string
  desc_uk: string
  spell_casting_ability: string
  subtypes_name: string
  document_slug: string
  document_title: string
  source: string
}

const ClassSchema = new Schema<IClass>(
  {
    name_en: { type: String, required: true },
    name_uk: { type: String, default: '' },
    slug: { type: String, required: true, unique: true },
    hit_dice: { type: String, default: '' },
    hp_at_1st_level: { type: String, default: '' },
    hp_at_1st_level_uk: { type: String, default: '' },
    hp_at_higher_levels: { type: String, default: '' },
    hp_at_higher_levels_uk: { type: String, default: '' },
    prof_armor: { type: String, default: '' },
    prof_armor_uk: { type: String, default: '' },
    prof_weapons: { type: String, default: '' },
    prof_weapons_uk: { type: String, default: '' },
    prof_tools: { type: String, default: '' },
    prof_tools_uk: { type: String, default: '' },
    prof_saving_throws: { type: String, default: '' },
    prof_saving_throws_uk: { type: String, default: '' },
    prof_skills: { type: String, default: '' },
    prof_skills_uk: { type: String, default: '' },
    equipment: { type: String, default: '' },
    equipment_uk: { type: String, default: '' },
    desc: { type: String, default: '' },
    desc_uk: { type: String, default: '' },
    spell_casting_ability: { type: String, default: '' },
    subtypes_name: { type: String, default: '' },
    document_slug: { type: String, default: '' },
    document_title: { type: String, default: '' },
    source: { type: String, default: 'open5e' },
  },
  { timestamps: true },
)

export default mongoose.models.Class ||
  mongoose.model<IClass>('Class', ClassSchema)
