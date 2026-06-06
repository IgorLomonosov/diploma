import { notFound } from 'next/navigation'
import connectDB from '@/lib/db/mongoose'
import Race from '@/lib/db/models/Race'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import ReactMarkdown from 'react-markdown'
import { t } from '@/lib/utils/translations'

interface Props {
  params: Promise<{ slug: string }>
}

const mdComponents = {
  p: ({ children }: any) => <p className="mb-3 last:mb-0">{children}</p>,
  strong: ({ children }: any) => (
    <strong className="font-semibold">{children}</strong>
  ),
}

export default async function RacePage({ params }: Props) {
  const { slug } = await params
  await connectDB()
  const race = await Race.findOne({ slug }).lean()
  if (!race) notFound()
  const r = race as any

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{r.name_uk || r.name_en}</h1>
        {r.name_uk && <p className="text-muted-foreground">{r.name_en}</p>}
        {r.document_title && (
          <p className="text-sm text-muted-foreground mt-1">
            📖 {r.document_title}
          </p>
        )}
      </div>

      <Card>
        <CardContent className="pt-4 space-y-2 text-sm">
          <div>
            <span className="font-medium">Швидкість: </span>
            {r.speed} фут.
          </div>
          {(r.asi_desc_uk || r.asi_desc) && (
            <div>
              <ReactMarkdown components={mdComponents}>
                {r.asi_desc_uk || r.asi_desc}
              </ReactMarkdown>
            </div>
          )}
        </CardContent>
      </Card>

      {(r.size_uk || r.size) && (
        <Card>
          <CardHeader>
            <CardTitle>Розмір</CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-relaxed">
            <ReactMarkdown components={mdComponents}>
              {r.size_uk || r.size}
            </ReactMarkdown>
          </CardContent>
        </Card>
      )}

      {(r.languages_uk || r.languages) && (
        <Card>
          <CardHeader>
            <CardTitle>Мови</CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-relaxed">
            <ReactMarkdown components={mdComponents}>
              {r.languages_uk || r.languages}
            </ReactMarkdown>
          </CardContent>
        </Card>
      )}

      {(r.vision_uk || r.vision) && (
        <Card>
          <CardHeader>
            <CardTitle>Зір</CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-relaxed">
            <ReactMarkdown components={mdComponents}>
              {r.vision_uk || r.vision}
            </ReactMarkdown>
          </CardContent>
        </Card>
      )}

      {(r.age_uk || r.age) && (
        <Card>
          <CardHeader>
            <CardTitle>Вік</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <ReactMarkdown components={mdComponents}>
              {r.age_uk || r.age}
            </ReactMarkdown>
          </CardContent>
        </Card>
      )}

      {(r.alignment_uk || r.alignment) && (
        <Card>
          <CardHeader>
            <CardTitle>Мировозрення</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <ReactMarkdown components={mdComponents}>
              {r.alignment_uk || r.alignment}
            </ReactMarkdown>
          </CardContent>
        </Card>
      )}

      {(r.traits_uk || r.traits) && (
        <Card>
          <CardHeader>
            <CardTitle>Расові риси</CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-relaxed">
            <ReactMarkdown components={mdComponents}>
              {r.traits_uk || r.traits}
            </ReactMarkdown>
          </CardContent>
        </Card>
      )}

      {r.subraces?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Підраси</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {r.subraces.map((sub: any, i: number) => (
              <div key={i} className="space-y-2">
                <h3 className="font-semibold text-base">
                  {sub.name_uk || sub.name}
                </h3>
                {(sub.desc_uk || sub.desc) && (
                  <div className="text-sm leading-relaxed">
                    <ReactMarkdown components={mdComponents}>
                      {sub.desc_uk || sub.desc}
                    </ReactMarkdown>
                  </div>
                )}
                {(sub.asi_desc_uk || sub.asi_desc) && (
                  <div className="text-sm">
                    <ReactMarkdown components={mdComponents}>
                      {sub.asi_desc_uk || sub.asi_desc}
                    </ReactMarkdown>
                  </div>
                )}
                {(sub.traits_uk || sub.traits) && (
                  <div className="text-sm leading-relaxed">
                    <ReactMarkdown components={mdComponents}>
                      {sub.traits_uk || sub.traits}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
