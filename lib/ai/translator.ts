import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
const model = genAI.getGenerativeModel(
  { model: 'gemini-2.5-flash' },
  { apiVersion: 'v1' },
)

const GLOSSARY = `
Використовуй наступний глосарій D&D термінів при перекладі:
- Saving Throw → Рятівний кидок
- Hit Points (HP) → Пункти здоров'я (ПЗ)
- Armor Class (AC) → Клас обладунку (КО)
- Challenge Rating (CR) → Показник небезпеки (ПН)
- Ability Check → Перевірка характеристики
- Attack Roll → Кидок атаки
- Damage → Пошкодження
- Spell → Заклинання
- Cantrip → Заговір
- Spell Slot → Слот заклинання
- Concentration → Концентрація
- Reaction → Реакція
- Bonus Action → Бонусна дія
- Action → Дія
- Movement → Рух
- Initiative → Ініціатива
- Proficiency Bonus → Бонус майстерності
- Advantage → Перевага
- Disadvantage → Недолік
- Multiattack → Мультиатака
- Grappled → Захоплений
- Frightened → Наляканий
- Paralyzed → Паралізований
- Poisoned → Отруєний
- Restrained → Скутий
- Stunned → Приголомшений
- Unconscious → Непритомний
- Blinded → Осліплений
- Charmed → Зачарований
- Deafened → Оглухлий
- Exhaustion → Виснаження
- Invisible → Невидимий
- Petrified → Скам'янілий
- Prone → Збитий з ніг
- Incapacitated → Недієздатний
- Melee → Ближній бій
- Ranged → Дальній бій
- Darkvision → Темний зір
- Tremorsense → Відчуття вібрацій
- Blindsight → Сліпе відчуття
- Truesight → Справжній зір
- Legendary Action → Легендарна дія
- Lair Action → Дія лігва
- Legendary Resistance → Легендарна стійкість
- Innate Spellcasting → Природне чарівництво
- Spellcasting → Чарівництво
- Traits → Риси
- Actions → Дії
- Reactions → Реакції
- Aberration → Аберація
- Beast → Звір
- Celestial → Небожитель
- Construct → Конструкт
- Dragon → Дракон
- Elemental → Елементаль
- Fey → Фея
- Fiend → Демон
- Giant → Велетень
- Humanoid → Гуманоїд
- Monstrosity → Монстр
- Ooze → Слиз
- Plant → Рослина
- Undead → Нежить
- Tiny → Крихітний
- Small → Малий
- Medium → Середній
- Large → Великий
- Huge → Величезний
- Gargantuan → Жахливий
`.trim()

async function generateJSON(
  prompt: string,
  retries = 3,
): Promise<Record<string, unknown>> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3 },
      })
      const text = result.response.text()
      const cleaned = text.replace(/```json\n?|\n?```/g, '').trim()
      return JSON.parse(cleaned)
    } catch (err: any) {
      const is503 = err?.status === 503 || err?.message?.includes('503')
      if (is503 && attempt < retries) {
        console.log(`Gemini 503, retry ${attempt}/${retries}...`)
        await new Promise((r) => setTimeout(r, 5000 * attempt))
        continue
      }
      throw err
    }
  }
  throw new Error('Max retries exceeded')
}

export async function translateMonster(monster: {
  name_en: string
  description_en: string
  size: string
  type: string
  alignment: string
  skills: string
  senses: string
  languages: string
  speed: string
  armor_desc: string
  damage_resistances: string
  damage_immunities: string
  condition_immunities: string
  actions: { name: string; description: string }[]
  special_abilities: { name: string; description: string }[]
  reactions: { name: string; description: string }[]
  legendary_actions: { name: string; description: string }[]
}) {
  const prompt = `
Ти — перекладач настільно-рольової гри Dungeons & Dragons.
Перекладай з англійської на українську мову.
${GLOSSARY}

Переклади наступний JSON:

${JSON.stringify({
  name_uk: monster.name_en,
  size_uk: monster.size,
  type_uk: monster.type,
  alignment_uk: monster.alignment,
  skills_uk: monster.skills,
  senses_uk: monster.senses,
  languages_uk: monster.languages,
  speed_uk: monster.speed,
  armor_desc_uk: monster.armor_desc,
  damage_resistances_uk: monster.damage_resistances,
  damage_immunities_uk: monster.damage_immunities,
  condition_immunities_uk: monster.condition_immunities,
  description_uk: monster.description_en,
  actions: monster.actions,
  special_abilities: monster.special_abilities,
  reactions: monster.reactions,
  legendary_actions: monster.legendary_actions,
})}

Правила:
- Переклади всі текстові поля
- actions, special_abilities, reactions, legendary_actions: переклади name і description кожного елементу
- Зберігай ігрові механіки (DC, кидки кубиків, числа) без змін
- Повертай ТІЛЬКИ валідний JSON
`

  return await generateJSON(prompt)
}

export async function translateSpell(spell: {
  name_en: string
  school: string
  casting_time: string
  range: string
  duration: string
  components: string
  description_en: string
  higher_levels_en: string
}) {
  const prompt = `
Ти — перекладач настільно-рольової гри Dungeons & Dragons.
Перекладай з англійської на українську мову.
${GLOSSARY}

Переклади наступний JSON:

${JSON.stringify({
  name_uk: spell.name_en,
  school_uk: spell.school,
  casting_time_uk: spell.casting_time,
  range_uk: spell.range,
  duration_uk: spell.duration,
  components_uk: spell.components,
  description_uk: spell.description_en,
  higher_levels_uk: spell.higher_levels_en,
})}

Правила:
- Переклади всі текстові поля
- Зберігай ігрові механіки (DC, кидки кубиків, числа) без змін
- Повертай ТІЛЬКИ валідний JSON
`

  return await generateJSON(prompt)
}

export async function translateRace(race: {
  name_en: string
  desc: string
  asi_desc: string
  age: string
  alignment: string
  size: string
  speed_desc: string
  languages: string
  vision: string
  traits: string
  subraces: {
    name: string
    desc: string
    asi_desc: string
    traits: string
  }[]
}) {
  const prompt = `
Ти — перекладач настільно-рольової гри Dungeons & Dragons.
Перекладай з англійської на українську мову.
${GLOSSARY}

Переклади наступний JSON:

${JSON.stringify({
  name_uk: race.name_en,
  desc_uk: race.desc,
  asi_desc_uk: race.asi_desc,
  age_uk: race.age,
  alignment_uk: race.alignment,
  size_uk: race.size,
  speed_desc_uk: race.speed_desc,
  languages_uk: race.languages,
  vision_uk: race.vision,
  traits_uk: race.traits,
  subraces: race.subraces.map((s) => ({
    name_uk: s.name,
    desc_uk: s.desc,
    asi_desc_uk: s.asi_desc,
    traits_uk: s.traits,
  })),
})}

Правила:
- Переклади всі текстові поля
- Зберігай Markdown форматування (**жирний**, _курсив_)
- Зберігай ігрові механіки (DC, кидки кубиків, числа) без змін
- Повертай ТІЛЬКИ валідний JSON
`

  return await generateJSON(prompt)
}
