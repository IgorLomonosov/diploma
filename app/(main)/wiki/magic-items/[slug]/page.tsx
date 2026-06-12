import { notFound } from 'next/navigation'
import connectDB from '@/lib/db/mongoose'
import MagicItem from '@/lib/db/models/MagicItem'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import ReactMarkdown from 'react-markdown'

interface Props {
  params: Promise<{ slug: string }>
}

const RARITY_UK: Record<string, string> = {
  common: 'Звичайний',
  uncommon: 'Незвичайний',
  rare: 'Рідкісний',
  'very rare': 'Дуже рідкісний',
  legendary: 'Легендарний',
  artifact: 'Артефакт',
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
}

export default async function MagicItemPage({ params }: Props) {
  const { slug } = await params
  await connectDB()
  const item = await MagicItem.findOne({ slug }).lean()
  if (!item) notFound()
  const i = item as any

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <div className="flex items-start justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-3xl font-bold">{i.name_uk || i.name_en}</h1>
            {i.name_uk && <p className="text-muted-foreground">{i.name_en}</p>}
          </div>
          {(i.rarity_uk || i.rarity) && (
            <Badge variant="outline" className="text-base px-3 py-1">
              {i.rarity_uk || RARITY_UK[i.rarity?.toLowerCase()] || i.rarity}
            </Badge>
          )}
        </div>
        {i.document_title && (
          <p className="text-sm text-muted-foreground mt-1">
            📖 {i.document_title}
          </p>
        )}
      </div>

      <Card>
        <CardContent className="pt-4 flex flex-wrap gap-3 text-sm">
          {(i.type_uk || i.type) && (
            <div>
              <span className="font-medium">Тип: </span>
              {i.type_uk || i.type}
            </div>
          )}
          {i.requires_attunement && i.requires_attunement !== 'no' && (
            <div>
              <span className="font-medium">Налаштування: </span>
              {i.requires_attunement === 'yes'
                ? 'Потрібне'
                : i.requires_attunement}
            </div>
          )}
        </CardContent>
      </Card>

      {(i.desc_uk || i.desc) && (
        <Card>
          <CardHeader>
            <CardTitle>Опис</CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-relaxed">
            <ReactMarkdown components={mdComponents}>
              {i.desc_uk || i.desc}
            </ReactMarkdown>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
