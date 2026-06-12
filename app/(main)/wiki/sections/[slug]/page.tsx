import { notFound } from 'next/navigation'
import connectDB from '@/lib/db/mongoose'
import Section from '@/lib/db/models/Section'
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
  h1: ({ children }: any) => (
    <h2 className="text-xl font-bold text-white mt-6 mb-2">{children}</h2>
  ),
  h2: ({ children }: any) => (
    <h3 className="text-lg font-semibold text-white mt-4 mb-2">{children}</h3>
  ),
  h3: ({ children }: any) => (
    <h4 className="text-base font-semibold text-white mt-3 mb-1">{children}</h4>
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

export default async function SectionPage({ params }: Props) {
  const { slug } = await params
  await connectDB()
  const section = await Section.findOne({ slug }).lean()
  if (!section) notFound()
  const s = section as any

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div>
        <h1 className="text-3xl font-bold text-white">
          {s.name_uk || s.name_en}
        </h1>
        {s.name_uk && <p className="text-slate-400">{s.name_en}</p>}
        <div className="flex gap-2 mt-2 flex-wrap">
          {s.parent && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">
              {s.parent}
            </span>
          )}
          {s.document_title && (
            <span className="text-xs text-slate-600">{s.document_title}</span>
          )}
        </div>
      </div>

      <div className={cardClass}>
        <div className="leading-relaxed">
          <ReactMarkdown components={mdComponents} remarkPlugins={[remarkGfm]}>
            {s.desc_uk || s.desc_en}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  )
}
