import { notFound } from 'next/navigation'
import connectDB from '@/lib/db/mongoose'
import Monster from '@/lib/db/models/Monster'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import ReactMarkdown from 'react-markdown'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function MonsterPage({ params }: Props) {
  const { slug } = await params
  await connectDB()
  const monster = await Monster.findOne({ slug }).lean()
  if (!monster) notFound()

  const m = monster as any

  const stats = [
    { label: 'СИЛ', value: m.strength, save: m.strength_save },
    { label: 'СПР', value: m.dexterity, save: m.dexterity_save },
    { label: 'ВИТ', value: m.constitution, save: m.constitution_save },
    { label: 'ІНТ', value: m.intelligence, save: m.intelligence_save },
    { label: 'МУД', value: m.wisdom, save: m.wisdom_save },
    { label: 'ХАР', value: m.charisma, save: m.charisma_save },
  ]

  const modifier = (val: number) => {
    const mod = Math.floor((val - 10) / 2)
    return mod >= 0 ? `+${mod}` : `${mod}`
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <div className="flex items-start justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-3xl font-bold">{m.name_uk || m.name_en}</h1>
            {m.name_uk && <p className="text-muted-foreground">{m.name_en}</p>}
          </div>
          <Badge variant="outline" className="text-base px-3 py-1">
            CR {m.challenge_rating}
          </Badge>
        </div>
        <p className="text-muted-foreground mt-1">
          {m.size_uk || m.size} {m.type_uk || m.type} ·{' '}
          {m.alignment_uk || m.alignment}
        </p>
        {m.document_title && (
          <p className="text-sm text-muted-foreground mt-1">
            📖 {m.document_title}
          </p>
        )}
      </div>

      <Card>
        <CardContent className="pt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
          <div>
            <span className="font-medium">Клас обладунку:</span> {m.armor_class}{' '}
            {(m.armor_desc_uk || m.armor_desc) &&
              `(${m.armor_desc_uk || m.armor_desc})`}
          </div>

          <div>
            <span className="font-medium">Пункти здоров'я:</span> {m.hit_points}{' '}
            ({m.hit_dice})
          </div>
          <div>
            <span className="font-medium">Швидкість:</span>{' '}
            {m.speed_uk || m.speed}
          </div>

          {m.initiative_bonus !== undefined && (
            <div>
              <span className="font-medium">Ініціатива:</span>{' '}
              {m.initiative_bonus >= 0
                ? `+${m.initiative_bonus}`
                : m.initiative_bonus}
            </div>
          )}
          {m.xp > 0 && (
            <div>
              <span className="font-medium">Досвід:</span> {m.xp} XP
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4">
          <div className="grid grid-cols-6 gap-2 text-center">
            {stats.map((stat) => (
              <div key={stat.label} className="space-y-1">
                <div className="text-xs font-medium text-muted-foreground">
                  {stat.label}
                </div>
                <div className="text-lg font-bold">{stat.value}</div>
                <div className="text-sm">({modifier(stat.value)})</div>
                {stat.save !== null && stat.save !== undefined && (
                  <div className="text-xs text-muted-foreground">
                    Рят: {stat.save >= 0 ? `+${stat.save}` : stat.save}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {(m.skills_uk || m.skills) && (
        <div className="text-sm">
          <span className="font-medium">Навички: </span>
          {m.skills_uk || m.skills}
        </div>
      )}
      {(m.damage_resistances_uk || m.damage_resistances) && (
        <div className="text-sm">
          <span className="font-medium">Стійкості до пошкоджень: </span>
          {m.damage_resistances_uk || m.damage_resistances}
        </div>
      )}
      {(m.damage_immunities_uk || m.damage_immunities) && (
        <div className="text-sm">
          <span className="font-medium">Імунітети: </span>
          {m.damage_immunities_uk || m.damage_immunities}
        </div>
      )}
      {(m.condition_immunities_uk || m.condition_immunities) && (
        <div className="text-sm">
          <span className="font-medium">Імунітет до станів: </span>
          {m.condition_immunities_uk || m.condition_immunities}
        </div>
      )}
      {(m.senses_uk || m.senses) && (
        <div className="text-sm">
          <span className="font-medium">Відчуття: </span>
          {m.senses_uk || m.senses}
        </div>
      )}
      {(m.languages_uk || m.languages) && (
        <div className="text-sm">
          <span className="font-medium">Мови: </span>
          {m.languages_uk || m.languages}
        </div>
      )}

      {m.description_uk && (
        <Card>
          <CardHeader>
            <CardTitle>Опис</CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-relaxed whitespace-pre-line">
            <ReactMarkdown
              components={{
                p: ({ children }) => (
                  <p className="mb-3 last:mb-0">{children}</p>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold">{children}</strong>
                ),
              }}
            >
              {m.description_uk}
            </ReactMarkdown>
          </CardContent>
        </Card>
      )}

      {m.special_abilities?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Риси</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {m.special_abilities.map((a: any, i: number) => (
              <div key={i}>
                <span className="font-medium">{a.name}. </span>
                <span className="text-sm">{a.description}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {m.actions?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Дії</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {m.actions.map((a: any, i: number) => (
              <div key={i}>
                <span className="font-medium">{a.name}. </span>
                <span className="text-sm">{a.description}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {m.reactions?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Реакції</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {m.reactions.map((a: any, i: number) => (
              <div key={i}>
                <span className="font-medium">{a.name}. </span>
                <span className="text-sm">{a.description}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {m.legendary_actions?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Легендарні дії</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {m.legendary_actions.map((a: any, i: number) => (
              <div key={i}>
                <span className="font-medium">{a.name}. </span>
                <span className="text-sm">{a.description}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
