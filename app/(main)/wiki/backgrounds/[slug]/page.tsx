import { notFound } from 'next/navigation'
import connectDB from '@/lib/db/mongoose'
import Background from '@/lib/db/models/Background'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

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
  h1: ({ children }: any) => (
    <h2 className="text-lg font-semibold text-white mt-4 mb-2">{children}</h2>
  ),
  h2: ({ children }: any) => (
    <h3 className="text-base font-semibold text-white mt-3 mb-1">{children}</h3>
  ),
  table: ({ children }: any) => (
    <div className="overflow-x-auto my-3">
      <table className="w-full text-sm border-collapse">{children}</table>
    </div>
  ),
  thead: ({ children }: any) => (
    <thead className="bg-slate-800">{children}</thead>
  ),
  th: ({ children }: any) => (
    <th className="border border-slate-600 px-3 py-2 text-left font-medium text-slate-300">
      {children}
    </th>
  ),
  td: ({ children }: any) => (
    <td className="border border-slate-700 px-3 py-2 align-top text-slate-300">
      {children}
    </td>
  ),
  tr: ({ children }: any) => <tr>{children}</tr>,
}

export default async function BackgroundPage({ params }: Props) {
  const { slug } = await params
  await connectDB()
  const bg = await Background.findOne({ slug }).lean()
  if (!bg) notFound()
  const b = bg as any

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div>
        <h1 className="text-3xl font-bold text-white">
          {b.name_uk || b.name_en}
        </h1>
        {b.name_uk && <p className="text-slate-400">{b.name_en}</p>}
        {b.document_title && (
          <p className="text-xs text-slate-600 mt-1">{b.document_title}</p>
        )}
      </div>

      <div className={cardClass}>
        <div className="space-y-2 text-sm">
          {(b.skill_proficiencies_uk || b.skill_proficiencies) && (
            <div>
              <span className="text-slate-500">Навички: </span>
              <span className="text-slate-300">
                {b.skill_proficiencies_uk || b.skill_proficiencies}
              </span>
            </div>
          )}
          {(b.tool_proficiencies_uk || b.tool_proficiencies) && (
            <div>
              <span className="text-slate-500">Інструменти: </span>
              <span className="text-slate-300">
                {b.tool_proficiencies_uk || b.tool_proficiencies}
              </span>
            </div>
          )}
          {(b.languages_uk || b.languages) && (
            <div>
              <span className="text-slate-500">Мови: </span>
              <span className="text-slate-300">
                {b.languages_uk || b.languages}
              </span>
            </div>
          )}
          {(b.equipment_uk || b.equipment) && (
            <div>
              <span className="text-slate-500">Спорядження: </span>
              <span className="text-slate-300">
                {b.equipment_uk || b.equipment}
              </span>
            </div>
          )}
        </div>
      </div>

      {(b.feature_uk || b.feature) && (b.feature_desc_uk || b.feature_desc) && (
        <div className={cardClass}>
          <h2 className={sectionTitle}>{b.feature_uk || b.feature}</h2>
          <div className="text-sm leading-relaxed">
            <ReactMarkdown
              components={mdComponents}
              remarkPlugins={[remarkGfm]}
            >
              {b.feature_desc_uk || b.feature_desc}
            </ReactMarkdown>
          </div>
        </div>
      )}

      {(b.desc_uk || b.desc) && (
        <div className={cardClass}>
          <h2 className={sectionTitle}>Опис</h2>
          <div className="text-sm leading-relaxed">
            <ReactMarkdown
              components={mdComponents}
              remarkPlugins={[remarkGfm]}
            >
              {b.desc_uk || b.desc}
            </ReactMarkdown>
          </div>
        </div>
      )}

      {(b.suggested_characteristics_uk || b.suggested_characteristics) && (
        <div className={cardClass}>
          <h2 className={sectionTitle}>Риси характеру</h2>
          <div className="text-sm leading-relaxed">
            <ReactMarkdown
              components={mdComponents}
              remarkPlugins={[remarkGfm]}
            >
              {b.suggested_characteristics_uk || b.suggested_characteristics}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  )
}
