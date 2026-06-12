import { notFound } from 'next/navigation'
import connectDB from '@/lib/db/mongoose'
import Monster from '@/lib/db/models/Monster'
import ReactMarkdown from 'react-markdown'
import { t } from '@/lib/utils/translations'
import MonsterImage from '../MonsterImage'

interface Props {
  params: Promise<{ slug: string }>
}

const modifier = (val: number) => {
  const mod = Math.floor((val - 10) / 2)
  return mod >= 0 ? `+${mod}` : `${mod}`
}

const cardClass = 'rounded-xl border border-slate-700 bg-slate-900/60 p-5'
const sectionTitle = 'text-base font-semibold text-white mb-3'

export default async function MonsterPage({ params }: Props) {
  const { slug } = await params
  await connectDB()
  const monster = await Monster.findOne({ slug }).lean()
  if (!monster) notFound()
  const m = monster as any

  const stats = [
    { label: 'СИЛ', value: m.strength, save: m.strength_save },
    { label: 'СПР', value: m.dexterity, save: m.dexterity_save },
    { label: 'ВИТ', value: m.constitution, save: m.constitution_save },
    { label: 'ІНТ', value: m.intelligence, save: m.intelligence_save },
    { label: 'МУД', value: m.wisdom, save: m.wisdom_save },
    { label: 'ХАР', value: m.charisma, save: m.charisma_save },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Шапка */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div className="flex gap-5 flex-wrap">
          {m.img_main && (
            <MonsterImage
              src={m.img_main}
              alt={m.name_uk || m.name_en}
              className="w-64 h-64 object-contain rounded-xl border border-slate-700 bg-slate-800/50 p-2 shrink-0"
            />
          )}
          <div>
            <h1 className="text-3xl font-bold text-white">
              {m.name_uk || m.name_en}
            </h1>
            {m.name_uk && <p className="text-slate-400">{m.name_en}</p>}
            <p className="text-slate-400 mt-1">
              {t.size(m.size)} {t.type(m.type, m.type_uk)} ·{' '}
              {t.alignment(m.alignment, m.alignment_uk)}
            </p>
            {m.document_title && (
              <p className="text-xs text-slate-600 mt-1">{m.document_title}</p>
            )}
          </div>
        </div>
        <span className="px-3 py-1 rounded-full border border-red-800 bg-red-900/30 text-red-300 font-semibold text-sm">
          CR {m.challenge_rating}
        </span>
      </div>

      {/* Бойові характеристики */}
      <div className={cardClass}>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm text-slate-300">
          <div>
            <span className="text-slate-500">Клас обладунку: </span>
            {m.armor_class}
            {m.armor_desc_uk || m.armor_desc
              ? ` (${m.armor_desc_uk || m.armor_desc})`
              : ''}
          </div>
          <div>
            <span className="text-slate-500">Пункти здоров'я: </span>
            {m.hit_points} ({m.hit_dice})
          </div>
          <div>
            <span className="text-slate-500">Швидкість: </span>
            {m.speed_uk || m.speed}
          </div>
          {m.initiative_bonus !== undefined && (
            <div>
              <span className="text-slate-500">Ініціатива: </span>
              {m.initiative_bonus >= 0
                ? `+${m.initiative_bonus}`
                : m.initiative_bonus}
            </div>
          )}
          {m.xp > 0 && (
            <div>
              <span className="text-slate-500">Досвід: </span>
              {m.xp} XP
            </div>
          )}
        </div>
      </div>

      {/* Характеристики */}
      <div className={cardClass}>
        <div className="grid grid-cols-6 gap-2 text-center">
          {stats.map((stat) => (
            <div key={stat.label} className="space-y-1">
              <div className="text-xs font-medium text-slate-500">
                {stat.label}
              </div>
              <div className="text-xl font-bold text-white">{stat.value}</div>
              <div className="text-sm text-slate-400">
                ({modifier(stat.value)})
              </div>
              {stat.save != null && (
                <div className="text-xs text-slate-500">
                  Рят: {stat.save >= 0 ? `+${stat.save}` : stat.save}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Додаткові поля */}
      <div
        className={`${cardClass} grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm`}
      >
        {(m.skills_uk || m.skills) && (
          <div>
            <span className="text-slate-500">Навички: </span>
            <span className="text-slate-300">{m.skills_uk || m.skills}</span>
          </div>
        )}
        {(m.damage_resistances_uk || m.damage_resistances) && (
          <div>
            <span className="text-slate-500">Стійкості: </span>
            <span className="text-slate-300">
              {m.damage_resistances_uk || m.damage_resistances}
            </span>
          </div>
        )}
        {(m.damage_immunities_uk || m.damage_immunities) && (
          <div>
            <span className="text-slate-500">Імунітети: </span>
            <span className="text-slate-300">
              {m.damage_immunities_uk || m.damage_immunities}
            </span>
          </div>
        )}
        {(m.condition_immunities_uk || m.condition_immunities) && (
          <div>
            <span className="text-slate-500">Імунітет до станів: </span>
            <span className="text-slate-300">
              {m.condition_immunities_uk || m.condition_immunities}
            </span>
          </div>
        )}
        {(m.senses_uk || m.senses) && (
          <div>
            <span className="text-slate-500">Відчуття: </span>
            <span className="text-slate-300">{m.senses_uk || m.senses}</span>
          </div>
        )}
        {(m.languages_uk || m.languages) && (
          <div>
            <span className="text-slate-500">Мови: </span>
            <span className="text-slate-300">
              {m.languages_uk || m.languages}
            </span>
          </div>
        )}
      </div>

      {/* Опис */}
      {m.description_uk && (
        <div className={cardClass}>
          <h2 className={sectionTitle}>Опис</h2>
          <div className="text-sm text-slate-300 leading-relaxed">
            <ReactMarkdown
              components={{
                p: ({ children }) => (
                  <p className="mb-3 last:mb-0">{children}</p>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-white">
                    {children}
                  </strong>
                ),
              }}
            >
              {m.description_uk}
            </ReactMarkdown>
          </div>
        </div>
      )}

      {/* Риси */}
      {m.special_abilities?.length > 0 && (
        <div className={cardClass}>
          <h2 className={sectionTitle}>Риси</h2>
          <div className="space-y-3">
            {m.special_abilities.map((a: any, i: number) => (
              <div key={i} className="text-sm text-slate-300">
                <span className="font-semibold text-white">{a.name}. </span>
                {a.description}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Дії */}
      {m.actions?.length > 0 && (
        <div className={cardClass}>
          <h2 className={sectionTitle}>Дії</h2>
          <div className="space-y-3">
            {m.actions.map((a: any, i: number) => (
              <div key={i} className="text-sm text-slate-300">
                <span className="font-semibold text-white">{a.name}. </span>
                {a.description}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Реакції */}
      {m.reactions?.length > 0 && (
        <div className={cardClass}>
          <h2 className={sectionTitle}>Реакції</h2>
          <div className="space-y-3">
            {m.reactions.map((a: any, i: number) => (
              <div key={i} className="text-sm text-slate-300">
                <span className="font-semibold text-white">{a.name}. </span>
                {a.description}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Легендарні дії */}
      {m.legendary_actions?.length > 0 && (
        <div className={cardClass}>
          <h2 className={sectionTitle}>Легендарні дії</h2>
          <div className="space-y-3">
            {m.legendary_actions.map((a: any, i: number) => (
              <div key={i} className="text-sm text-slate-300">
                <span className="font-semibold text-white">{a.name}. </span>
                {a.description}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
