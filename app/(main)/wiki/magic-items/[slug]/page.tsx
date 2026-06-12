import { notFound } from 'next/navigation'
import connectDB from '@/lib/db/mongoose'
import MagicItem from '@/lib/db/models/MagicItem'
import ReactMarkdown from 'react-markdown'

interface Props {
  params: Promise<{ slug: string }>
}

const cardClass = 'rounded-xl border border-slate-700 bg-slate-900/60 p-5'
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

const RARITY_UK: Record<string, string> = {
  common: 'Звичайний',
  uncommon: 'Незвичайний',
  rare: 'Рідкісний',
  'very rare': 'Дуже рідкісний',
  legendary: 'Легендарний',
  artifact: 'Артефакт',
}

export default async function MagicItemPage({ params }: Props) {
  const { slug } = await params
  await connectDB()
  const item = await MagicItem.findOne({ slug }).lean()
  if (!item) notFound()
  const i = item as any

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-white">
            {i.name_uk || i.name_en}
          </h1>
          {i.name_uk && <p className="text-slate-400">{i.name_en}</p>}
          {i.document_title && (
            <p className="text-xs text-slate-600 mt-1">{i.document_title}</p>
          )}
        </div>
        {i.rarity && (
          <span className="px-3 py-1 rounded-full border border-red-800 bg-red-900/30 text-red-300 text-sm font-medium">
            {i.rarity_uk || RARITY_UK[i.rarity?.toLowerCase()] || i.rarity}
          </span>
        )}
      </div>

      <div className={cardClass}>
        <div className="flex flex-wrap gap-4 text-sm">
          {(i.type_uk || i.type) && (
            <div>
              <span className="text-slate-500">Тип: </span>
              <span className="text-slate-300">{i.type_uk || i.type}</span>
            </div>
          )}
          {i.requires_attunement && i.requires_attunement !== 'no' && (
            <div>
              <span className="text-slate-500">Налаштування: </span>
              <span className="text-red-400">Потрібне</span>
            </div>
          )}
        </div>
      </div>

      {(i.desc_uk || i.desc) && (
        <div className={cardClass}>
          <h2 className="text-base font-semibold text-white mb-3">Опис</h2>
          <div className="text-sm leading-relaxed">
            <ReactMarkdown components={mdComponents}>
              {i.desc_uk || i.desc}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  )
}
