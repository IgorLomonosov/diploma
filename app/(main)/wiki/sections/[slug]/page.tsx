import { notFound } from 'next/navigation'
import connectDB from '@/lib/db/mongoose'
import Section from '@/lib/db/models/Section'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Props {
  params: Promise<{ slug: string }>
}

const mdComponents = {
  p: ({ children }: any) => <p className="mb-3 last:mb-0">{children}</p>,
  strong: ({ children }: any) => (
    <strong className="font-semibold">{children}</strong>
  ),
  ul: ({ children }: any) => (
    <ul className="list-disc pl-5 mb-3 space-y-1">{children}</ul>
  ),
  li: ({ children }: any) => <li>{children}</li>,
  h1: ({ children }: any) => (
    <h2 className="text-xl font-bold mt-6 mb-2">{children}</h2>
  ),
  h2: ({ children }: any) => (
    <h3 className="text-lg font-semibold mt-4 mb-2">{children}</h3>
  ),
  h3: ({ children }: any) => (
    <h4 className="text-base font-semibold mt-3 mb-1">{children}</h4>
  ),
  table: ({ children }: any) => (
    <div className="overflow-x-auto my-3">
      <table className="w-full text-sm border-collapse">{children}</table>
    </div>
  ),
  thead: ({ children }: any) => <thead className="bg-muted">{children}</thead>,
  th: ({ children }: any) => (
    <th className="border border-border px-3 py-2 text-left font-medium">
      {children}
    </th>
  ),
  td: ({ children }: any) => (
    <td className="border border-border px-3 py-2 align-top">{children}</td>
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
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{s.name_uk || s.name_en}</h1>
        {s.name_uk && <p className="text-muted-foreground">{s.name_en}</p>}
        <div className="flex gap-2 mt-2 flex-wrap">
          {s.parent && <Badge variant="secondary">{s.parent}</Badge>}
          {s.document_title && (
            <Badge variant="outline">📖 {s.document_title}</Badge>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="pt-6 leading-relaxed">
          <ReactMarkdown components={mdComponents} remarkPlugins={[remarkGfm]}>
            {s.desc_uk || s.desc_en}
          </ReactMarkdown>
        </CardContent>
      </Card>
    </div>
  )
}
