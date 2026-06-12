import { notFound } from 'next/navigation'
import connectDB from '@/lib/db/mongoose'
import Background from '@/lib/db/models/Background'
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
  h1: ({ children }: any) => (
    <h2 className="text-lg font-semibold mt-4 mb-2">{children}</h2>
  ),
  h2: ({ children }: any) => (
    <h3 className="text-base font-semibold mt-3 mb-1">{children}</h3>
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

export default async function BackgroundPage({ params }: Props) {
  const { slug } = await params
  await connectDB()
  const bg = await Background.findOne({ slug }).lean()
  if (!bg) notFound()
  const b = bg as any

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{b.name_uk || b.name_en}</h1>
        {b.name_uk && <p className="text-muted-foreground">{b.name_en}</p>}
        {b.document_title && (
          <p className="text-sm text-muted-foreground mt-1">
            📖 {b.document_title}
          </p>
        )}
      </div>

      <Card>
        <CardContent className="pt-4 space-y-2 text-sm">
          {(b.skill_proficiencies_uk || b.skill_proficiencies) && (
            <div>
              <span className="font-medium">Навички: </span>
              {b.skill_proficiencies_uk || b.skill_proficiencies}
            </div>
          )}
          {(b.tool_proficiencies_uk || b.tool_proficiencies) && (
            <div>
              <span className="font-medium">Інструменти: </span>
              {b.tool_proficiencies_uk || b.tool_proficiencies}
            </div>
          )}
          {(b.languages_uk || b.languages) && (
            <div>
              <span className="font-medium">Мови: </span>
              {b.languages_uk || b.languages}
            </div>
          )}
          {(b.equipment_uk || b.equipment) && (
            <div>
              <span className="font-medium">Спорядження: </span>
              {b.equipment_uk || b.equipment}
            </div>
          )}
        </CardContent>
      </Card>

      {(b.feature_uk || b.feature) && (b.feature_desc_uk || b.feature_desc) && (
        <Card>
          <CardHeader>
            <CardTitle>{b.feature_uk || b.feature}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-relaxed">
            <ReactMarkdown
              components={mdComponents}
              remarkPlugins={[remarkGfm]}
            >
              {b.feature_desc_uk || b.feature_desc}
            </ReactMarkdown>
          </CardContent>
        </Card>
      )}

      {(b.desc_uk || b.desc) && (
        <Card>
          <CardHeader>
            <CardTitle>Опис</CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-relaxed">
            <ReactMarkdown
              components={mdComponents}
              remarkPlugins={[remarkGfm]}
            >
              {b.desc_uk || b.desc}
            </ReactMarkdown>
          </CardContent>
        </Card>
      )}

      {(b.suggested_characteristics_uk || b.suggested_characteristics) && (
        <Card>
          <CardHeader>
            <CardTitle>Риси характеру</CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-relaxed">
            <ReactMarkdown
              components={mdComponents}
              remarkPlugins={[remarkGfm]}
            >
              {b.suggested_characteristics_uk || b.suggested_characteristics}
            </ReactMarkdown>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
