import { notFound } from 'next/navigation'
import connectDB from '@/lib/db/mongoose'
import Class from '@/lib/db/models/Class'
import ReactMarkdown from 'react-markdown'

interface Props {
  params: Promise<{ slug: string }>
}

const cardClass = 'rounded-xl border border-slate-700 bg-slate-900/60 p-5'
const sectionTitle = 'text-base font-semibold text-white mb-3'
const mdComponents = {
  p: ({ children }: any) => (
    <p className="mb-3 last:mb-0 text-slate-300">{children}</p>
  ),
  strong: ({ children }: any) => (
    <strong className="font-semibold text-white">{children}</strong>
  ),
  ul: ({ children }: any) => (
    <ul className="list-disc pl-5 mb-3 space-y-1 text-slate-300">{children}</ul>
  ),
  li: ({ children }: any) => <li>{children}</li>,
}

export default async function ClassPage({ params }: Props) {
  const { slug } = await params
  await connectDB()
  const cls = await Class.findOne({ slug }).lean()
  if (!cls) notFound()
  const c = cls as any

  const proficiencies = [
    { label: 'Обладунки', value: c.prof_armor_uk || c.prof_armor },
    { label: 'Зброя', value: c.prof_weapons_uk || c.prof_weapons },
    { label: 'Інструменти', value: c.prof_tools_uk || c.prof_tools },
    {
      label: 'Рятівні кидки',
      value: c.prof_saving_throws_uk || c.prof_saving_throws,
    },
    { label: 'Навички', value: c.prof_skills_uk || c.prof_skills },
  ].filter((p) => p.value)

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div>
        <h1 className="text-3xl font-bold text-white">
          {c.name_uk || c.name_en}
        </h1>
        {c.name_uk && <p className="text-slate-400">{c.name_en}</p>}
        {c.document_title && (
          <p className="text-xs text-slate-600 mt-1">{c.document_title}</p>
        )}
      </div>

      <div className={cardClass}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          {c.hit_dice && (
            <div>
              <span className="text-slate-500">Кістки ПЗ: </span>
              <span className="text-slate-300">{c.hit_dice}</span>
            </div>
          )}
          {(c.hp_at_1st_level_uk || c.hp_at_1st_level) && (
            <div className="sm:col-span-2">
              <span className="text-slate-500">ПЗ на 1 рівні: </span>
              <span className="text-slate-300">
                {c.hp_at_1st_level_uk || c.hp_at_1st_level}
              </span>
            </div>
          )}
          {(c.hp_at_higher_levels_uk || c.hp_at_higher_levels) && (
            <div className="sm:col-span-2">
              <span className="text-slate-500">ПЗ на вищих рівнях: </span>
              <span className="text-slate-300">
                {c.hp_at_higher_levels_uk || c.hp_at_higher_levels}
              </span>
            </div>
          )}
        </div>
      </div>

      {proficiencies.length > 0 && (
        <div className={cardClass}>
          <h2 className={sectionTitle}>Володіння</h2>
          <div className="space-y-2 text-sm">
            {proficiencies.map((p) => (
              <div key={p.label}>
                <span className="text-slate-500">{p.label}: </span>
                <span className="text-slate-300">{p.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {(c.equipment_uk || c.equipment) && (
        <div className={cardClass}>
          <h2 className={sectionTitle}>Спорядження</h2>
          <div className="text-sm leading-relaxed">
            <ReactMarkdown components={mdComponents}>
              {c.equipment_uk || c.equipment}
            </ReactMarkdown>
          </div>
        </div>
      )}

      {(c.desc_uk || c.desc) && (
        <div className={cardClass}>
          <h2 className={sectionTitle}>Опис</h2>
          <div className="text-sm leading-relaxed">
            <ReactMarkdown components={mdComponents}>
              {c.desc_uk || c.desc}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  )
}
