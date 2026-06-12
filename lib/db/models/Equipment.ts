import mongoose, { Schema } from 'mongoose'

const EquipmentSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true },
    name_en: { type: String, required: true },
    name_uk: { type: String, default: '' },
    category: { type: String, default: '' }, // weapon / armor / gear
    category_uk: { type: String, default: '' },
    cost: { type: String, default: '' }, // "10 gp"
    weight: { type: String, default: '' },
    desc_en: { type: String, default: '' },
    desc_uk: { type: String, default: '' },
    // Зброя
    damage_dice: { type: String, default: '' }, // "1d6"
    damage_type: { type: String, default: '' }, // "slashing"
    damage_type_uk: { type: String, default: '' },
    properties: [{ type: String }], // ["finesse", "light"]
    properties_uk: [{ type: String }],
    weapon_range: { type: String, default: '' }, // "Melee" / "Ranged"
    // Обладунок
    armor_class: { type: String, default: '' }, // "11 + Dex modifier"
    armor_category: { type: String, default: '' }, // "Light" / "Medium" / "Heavy"
    strength_requirement: { type: Number, default: 0 },
    stealth_disadvantage: { type: Boolean, default: false },
    document_slug: { type: String, default: '' },
    document_title: { type: String, default: '' },
  },
  { timestamps: true },
)

export default mongoose.models.Equipment ||
  mongoose.model('Equipment', EquipmentSchema)
