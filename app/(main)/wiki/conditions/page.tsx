import Link from 'next/link'
import connectDB from '@/lib/db/mongoose'
import Condition from '@/lib/db/models/Condition'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const CONDITION_ICONS: Record<string, string> = {
  blinded: '👁️',
  charmed: '💕',
  deafened: '👂',
  exhaustion: '😩',
  frightened: '😱',
  grappled: '🤝',
  incapacitated: '💫',
  invisible: '👻',
  paralyzed: '⚡',
  petrified: '🗿',
  poisoned: '☠️',
  prone: '⬇️',
  restrained: '⛓️',
  stunned: '💥',
  unconscious: '😴',
}

export default async function ConditionsPage() {
  await connectDB()
  const conditions = await Condition.find()
    .sort({ name_en: 1 })
    .select('slug name_en name_uk desc_en desc_uk')
    .lean()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Стани</h1>
        <p className="text-muted-foreground mt-1">
          {conditions.length} станів у базі
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {conditions.map((c: any) => (
          <Card
            key={c.slug}
            id={c.slug}
            className="hover:shadow-md transition-shadow"
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <span>{CONDITION_ICONS[c.slug] || '⚠️'}</span>
                <span>{c.name_uk || c.name_en}</span>
                {c.name_uk && (
                  <span className="text-sm font-normal text-muted-foreground">
                    {c.name_en}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground leading-relaxed">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {c.desc_uk || c.desc_en}
              </ReactMarkdown>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
