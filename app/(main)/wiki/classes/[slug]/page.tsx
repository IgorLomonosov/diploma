import { notFound } from 'next/navigation'
import connectDB from '@/lib/db/mongoose'
import Class from '@/lib/db/models/Class'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import ReactMarkdown from 'react-markdown'

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
}

export default async function ClassPage({ params }: Props) {
  const { slug } = await params
  await connectDB()
  const cls = await Class.findOne({ slug }).lean()
  if (!cls) notFound()
  const c = cls as any

  const proficiencies = [
    { label: 'Обладунки', en: c.prof_armor, uk: c.prof_armor_uk },
    { label: 'Зброя', en: c.prof_weapons, uk: c.prof_weapons_uk },
    { label: 'Інструменти', en: c.prof_tools, uk: c.prof_tools_uk },
    {
      label: 'Рятівні кидки',
      en: c.prof_saving_throws,
      uk: c.prof_saving_throws_uk,
    },
    { label: 'Навички', en: c.prof_skills, uk: c.prof_skills_uk },
  ]

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{c.name_uk || c.name_en}</h1>
        {c.name_uk && <p className="text-muted-foreground">{c.name_en}</p>}
        {c.document_title && (
          <p className="text-sm text-muted-foreground mt-1">
            📖 {c.document_title}
          </p>
        )}
      </div>

      <Card>
        <CardContent className="pt-4 grid grid-cols-2 gap-3 text-sm">
          {c.hit_dice && (
            <div>
              <span className="font-medium">Кістки ПЗ: </span>
              {c.hit_dice}
            </div>
          )}
          {(c.hp_at_1st_level_uk || c.hp_at_1st_level) && (
            <div className="col-span-2">
              <span className="font-medium">ПЗ на 1 рівні: </span>
              {c.hp_at_1st_level_uk || c.hp_at_1st_level}
            </div>
          )}
          {(c.hp_at_higher_levels_uk || c.hp_at_higher_levels) && (
            <div className="col-span-2">
              <span className="font-medium">ПЗ на вищих рівнях: </span>
              {c.hp_at_higher_levels_uk || c.hp_at_higher_levels}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Володіння</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {proficiencies.map(
            (p) =>
              (p.en || p.uk) && (
                <div key={p.label}>
                  <span className="font-medium">{p.label}: </span>
                  {p.uk || p.en}
                </div>
              ),
          )}
        </CardContent>
      </Card>

      {(c.equipment_uk || c.equipment) && (
        <Card>
          <CardHeader>
            <CardTitle>Спорядження</CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-relaxed">
            <ReactMarkdown components={mdComponents}>
              {c.equipment_uk || c.equipment}
            </ReactMarkdown>
          </CardContent>
        </Card>
      )}

      {(c.desc_uk || c.desc) && (
        <Card>
          <CardHeader>
            <CardTitle>Опис</CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-relaxed">
            <ReactMarkdown components={mdComponents}>
              {c.desc_uk || c.desc}
            </ReactMarkdown>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
