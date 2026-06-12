import { notFound } from 'next/navigation'
import connectDB from '@/lib/db/mongoose'
import Spell from '@/lib/db/models/Spell'
import ReactMarkdown from 'react-markdown'
import { t } from '@/lib/utils/translations'

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

export default async function SpellPage({ params }: Props) {
  const { slug } = await params
  await connectDB()
  const spell = await Spell.findOne({ slug }).lean()
  if (!spell) notFound()
  const s = spell as any
  const levelLabel = s.level === 0 ? 'Заговір' : `Заклинання ${s.level} рівня`

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-white">
            {s.name_uk || s.name_en}
          </h1>
          {s.name_uk && <p className="text-slate-400">{s.name_en}</p>}
          <p className="text-slate-400 mt-1">
            {t.school(s.school, s.school_uk)}
            {s.ritual && ' · Ритуал'}
          </p>
          {s.document_title && (
            <p className="text-xs text-slate-600 mt-1">{s.document_title}</p>
          )}
        </div>
        <span className="px-3 py-1 rounded-full border border-red-800 bg-red-900/30 text-red-300 font-semibold text-sm">
          {levelLabel}
        </span>
      </div>

      <div className={cardClass}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-slate-500">Час виклику: </span>
            <span className="text-slate-300">
              {t.castingTime(s.casting_time, s.casting_time_uk)}
            </span>
          </div>
          <div>
            <span className="text-slate-500">Дистанція: </span>
            <span className="text-slate-300">
              {t.range(s.range, s.range_uk)}
            </span>
          </div>
          <div>
            <span className="text-slate-500">Тривалість: </span>
            <span className="text-slate-300">
              {t.duration(s.duration, s.duration_uk)}
            </span>
          </div>
          <div>
            <span className="text-slate-500">Компоненти: </span>
            <span className="text-slate-300">
              {s.components_uk || s.components}
            </span>
            {s.material && (
              <span className="text-slate-500"> ({s.material})</span>
            )}
          </div>
          {s.classes?.length > 0 && (
            <div className="sm:col-span-2">
              <span className="text-slate-500">Класи: </span>
              <span className="text-slate-300">{s.classes.join(', ')}</span>
            </div>
          )}
        </div>
      </div>

      {(s.description_uk || s.description_en) && (
        <div className={cardClass}>
          <h2 className={sectionTitle}>Опис</h2>
          <ReactMarkdown components={mdComponents}>
            {s.description_uk || s.description_en}
          </ReactMarkdown>
        </div>
      )}

      {(s.higher_levels_uk || s.higher_levels_en) && (
        <div className={cardClass}>
          <h2 className={sectionTitle}>На вищих рівнях</h2>
          <ReactMarkdown components={mdComponents}>
            {s.higher_levels_uk || s.higher_levels_en}
          </ReactMarkdown>
        </div>
      )}
    </div>
  )
}
