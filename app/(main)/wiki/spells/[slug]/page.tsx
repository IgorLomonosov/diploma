import { notFound } from 'next/navigation'
import connectDB from '@/lib/db/mongoose'
import Spell from '@/lib/db/models/Spell'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import ReactMarkdown from 'react-markdown'
import { t } from '@/lib/utils/translations'

interface Props {
  params: Promise<{ slug: string }>
}

const SCHOOL_UK: Record<string, string> = {
  abjuration: 'Захист',
  conjuration: 'Виклик',
  divination: 'Пророцтво',
  enchantment: 'Чарування',
  evocation: 'Воплочення',
  illusion: 'Ілюзія',
  necromancy: 'Некромантія',
  transmutation: 'Перетворення',
}

export default async function SpellPage({ params }: Props) {
  const { slug } = await params
  await connectDB()
  const spell = await Spell.findOne({ slug }).lean()
  if (!spell) notFound()

  const s = spell as any
  const levelLabel = s.level === 0 ? 'Заговір' : `Заклинання ${s.level} рівня`

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <div className="flex items-start justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-3xl font-bold">{s.name_uk || s.name_en}</h1>
            {s.name_uk && <p className="text-muted-foreground">{s.name_en}</p>}
          </div>
          <Badge className="text-base px-3 py-1">{levelLabel}</Badge>
        </div>
        <p className="text-muted-foreground mt-1">
          {t.school(s.school, s.school_uk)}
          {s.ritual && ' · Ритуал'}
        </p>
        {s.document_title && (
          <p className="text-sm text-muted-foreground mt-1">
            📖 {s.document_title}
          </p>
        )}
      </div>

      <Card>
        <CardContent className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div>
            <span className="font-medium">Час виклику: </span>
            {t.castingTime(s.casting_time, s.casting_time_uk)}
          </div>
          <div>
            <span className="font-medium">Дистанція: </span>
            {t.range(s.range, s.range_uk)}
          </div>
          <div>
            <span className="font-medium">Тривалість: </span>
            {t.duration(s.duration, s.duration_uk)}
          </div>
          <div>
            <span className="font-medium">Компоненти: </span>
            {s.components_uk || s.components}
            {s.material && (
              <span className="text-muted-foreground"> ({s.material})</span>
            )}
          </div>
          {s.classes?.length > 0 && (
            <div className="sm:col-span-2">
              <span className="font-medium">Класи: </span>
              {s.classes.join(', ')}
            </div>
          )}
        </CardContent>
      </Card>

      {(s.description_uk || s.description_en) && (
        <Card>
          <CardHeader>
            <CardTitle>Опис</CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-relaxed">
            <ReactMarkdown
              components={{
                p: ({ children }) => (
                  <p className="mb-3 last:mb-0">{children}</p>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold">{children}</strong>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc pl-5 mb-3 space-y-1">{children}</ul>
                ),
                li: ({ children }) => <li>{children}</li>,
              }}
            >
              {s.description_uk || s.description_en}
            </ReactMarkdown>
          </CardContent>
        </Card>
      )}

      {(s.higher_levels_uk || s.higher_levels_en) && (
        <Card>
          <CardHeader>
            <CardTitle>На вищих рівнях</CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-relaxed">
            <ReactMarkdown
              components={{
                p: ({ children }) => (
                  <p className="mb-3 last:mb-0">{children}</p>
                ),
              }}
            >
              {s.higher_levels_uk || s.higher_levels_en}
            </ReactMarkdown>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
