import Link from 'next/link'
import connectDB from '@/lib/db/mongoose'
import Condition from '@/lib/db/models/Condition'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const CONDITION_ICONS: Record<string, string> = {
  blinded: '👁️',
  charmed: '💕',
  deafened: '👂',
  exhaustion: '😩',
  frightened: '😱',
  grappled: '🤝',
  incapacitated: '💫',
  invisible: '👻',
  paralyzed: '⚡',
  petrified: '🗿',
  poisoned: '☠️',
  prone: '⬇️',
  restrained: '⛓️',
  stunned: '💥',
  unconscious: '😴',
}

export default async function ConditionsPage() {
  await connectDB()
  const conditions = await Condition.find().sort({ name_en: 1 }).lean()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Стани</h1>
        <p className="text-slate-400 mt-1">{conditions.length} станів у базі</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {conditions.map((c: any) => (
          <div
            key={c.slug}
            id={c.slug}
            className="p-4 rounded-xl border border-slate-700 bg-slate-900/60"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">{CONDITION_ICONS[c.slug] || '⚠️'}</span>
              <h2 className="font-semibold text-white text-lg">
                {c.name_uk || c.name_en}
              </h2>
              {c.name_uk && (
                <span className="text-sm text-slate-500">{c.name_en}</span>
              )}
            </div>
            <div className="text-sm text-slate-300 leading-relaxed">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {c.desc_uk || c.desc_en}
              </ReactMarkdown>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
