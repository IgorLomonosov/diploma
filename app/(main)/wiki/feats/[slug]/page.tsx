import { notFound } from 'next/navigation'
import connectDB from '@/lib/db/mongoose'
import Feat from '@/lib/db/models/Feat'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

export default async function FeatPage({ params }: Props) {
  const { slug } = await params
  await connectDB()
  const feat = await Feat.findOne({ slug }).lean()
  if (!feat) notFound()
  const f = feat as any

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{f.name_uk || f.name_en}</h1>
        {f.name_uk && <p className="text-muted-foreground">{f.name_en}</p>}
        {f.document_title && (
          <p className="text-sm text-muted-foreground mt-1">
            📖 {f.document_title}
          </p>
        )}
      </div>

      {(f.prerequisite_uk || f.prerequisite) && (
        <div className="text-sm">
          <span className="font-medium">Передумова: </span>
          {f.prerequisite_uk || f.prerequisite}
        </div>
      )}

      {(f.desc_uk || f.desc) && (
        <Card>
          <CardHeader>
            <CardTitle>Опис</CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-relaxed">
            <ReactMarkdown
              components={mdComponents}
              remarkPlugins={[remarkGfm]}
            >
              {f.desc_uk || f.desc}
            </ReactMarkdown>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
