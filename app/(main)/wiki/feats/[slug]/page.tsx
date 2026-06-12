import { notFound } from 'next/navigation'
import connectDB from '@/lib/db/mongoose'
import Feat from '@/lib/db/models/Feat'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

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

export default async function FeatPage({ params }: Props) {
  const { slug } = await params
  await connectDB()
  const feat = await Feat.findOne({ slug }).lean()
  if (!feat) notFound()
  const f = feat as any

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div>
        <h1 className="text-3xl font-bold text-white">
          {f.name_uk || f.name_en}
        </h1>
        {f.name_uk && <p className="text-slate-400">{f.name_en}</p>}
        {f.document_title && (
          <p className="text-xs text-slate-600 mt-1">{f.document_title}</p>
        )}
      </div>

      {(f.prerequisite_uk || f.prerequisite) && (
        <div className="text-sm">
          <span className="text-slate-500">Передумова: </span>
          <span className="text-slate-300">
            {f.prerequisite_uk || f.prerequisite}
          </span>
        </div>
      )}

      {(f.desc_uk || f.desc) && (
        <div className={cardClass}>
          <h2 className="text-base font-semibold text-white mb-3">Опис</h2>
          <div className="text-sm leading-relaxed">
            <ReactMarkdown
              components={mdComponents}
              remarkPlugins={[remarkGfm]}
            >
              {f.desc_uk || f.desc}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  )
}
