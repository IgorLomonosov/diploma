'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { t } from '@/lib/utils/translations'

const ABILITY_LABELS: Record<string, string> = {
  strength: 'СИЛ',
  dexterity: 'СПР',
  constitution: 'ВИТ',
  intelligence: 'ІНТ',
  wisdom: 'МУД',
  charisma: 'ХАР',
}

const SKILL_ABILITY: Record<string, string> = {
  'Акробатика': 'dexterity',
  'Догляд за тваринами': 'wisdom',
  'Таємні знання': 'intelligence',
  'Атлетика': 'strength',
  'Обман': 'charisma',
  'Історія': 'intelligence',
  'Проникливість': 'wisdom',
  'Залякування': 'charisma',
  'Розслідування': 'intelligence',
  'Медицина': 'wisdom',
  'Природознавство': 'intelligence',
  'Сприйняття': 'wisdom',
  'Виступ': 'charisma',
  'Переконання': 'charisma',
  'Релігія': 'intelligence',
  'Спритність рук': 'dexterity',
  'Непомітність': 'dexterity',
  'Виживання': 'wisdom',
}

const DEFAULT_SKILLS = Object.keys(SKILL_ABILITY)

function modifier(val: number) {
  const mod = Math.floor((val - 10) / 2)
  return mod >= 0 ? `+${mod}` : `${mod}`
}

function modNum(val: number) {
  return Math.floor((val - 10) / 2)
}

export default function CharacterSheetPage() {
  const { id } = useParams()
  const router = useRouter()
  const [character, setCharacter] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [currentHp, setCurrentHp] = useState(0)
  const [hpDelta, setHpDelta] = useState('')

  useEffect(() => {
    fetch(`/api/characters/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setCharacter(data.data)
        setCurrentHp(data.data.current_hit_points)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  const updateHp = async (newHp: number) => {
    const clamped = Math.max(0, Math.min(newHp, character.max_hit_points))
    setCurrentHp(clamped)
    await fetch(`/api/characters/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ current_hit_points: clamped }),
    })
  }

  const applyDelta = (sign: 1 | -1) => {
    const val = parseInt(hpDelta)
    if (isNaN(val) || val <= 0) return
    updateHp(currentHp + sign * val)
    setHpDelta('')
  }

  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-pulse">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-40 rounded-lg bg-muted" />
      ))}
    </div>
  )

  if (!character) return <p className="text-muted-foreground">Персонажа не знайдено</p>

  const c = character
  const abilities = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma']

  const skillList = DEFAULT_SKILLS.map((skillName) => {
    const saved = c.skills?.find((s: any) => s.name === skillName)
    const abilityKey = SKILL_ABILITY[skillName]
    const abilityVal = c[abilityKey] ?? 10
    const profBonus = c.proficiency_bonus ?? 2
    const isProficient = saved?.proficient ?? false
    const isExpertise = saved?.expertise ?? false
    const bonus = modNum(abilityVal) + (isExpertise ? profBonus * 2 : isProficient ? profBonus : 0)
    return { name: skillName, bonus, isProficient, isExpertise, ability: ABILITY_LABELS[abilityKey] }
  })

  const hpPercent = c.max_hit_points > 0
    ? Math.round((currentHp / c.max_hit_points) * 100)
    : 0
  const hpColor = hpPercent > 50 ? 'bg-green-500' : hpPercent > 25 ? 'bg-yellow-500' : 'bg-red-500'

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Шапка */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold">{c.name}</h1>
          <p className="text-muted-foreground mt-1">
            {c.race && `${c.race} · `}{c.class} {c.level} рівня
            {c.background && ` · ${c.background}`}
          </p>
          {c.alignment && (
            <p className="text-sm text-muted-foreground">
              {t.alignment(c.alignment)}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {c.inspiration && <Badge>✨ Натхнення</Badge>}
          <Button variant="outline" size="sm" onClick={() => router.push(`/character/${id}/edit`)}>
            Редагувати
          </Button>
        </div>
      </div>

      {/* Бойові характеристики */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Клас обладунку', value: c.armor_class },
          { label: 'Швидкість', value: `${c.speed} фут.` },
          { label: 'Бонус майстерності', value: `+${c.proficiency_bonus}` },
          { label: 'Досвід', value: c.experience_points },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-4 text-center">
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Здоров'я */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Пункти здоров'я</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold">{currentHp}</span>
            <span className="text-muted-foreground">/ {c.max_hit_points}</span>
          </div>
          <div className="w-full bg-muted rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all ${hpColor}`}
              style={{ width: `${hpPercent}%` }}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={hpDelta}
              onChange={(e) => setHpDelta(e.target.value)}
              placeholder="0"
              className="w-20 h-9 rounded-md border border-input bg-background px-3 text-sm"
              min="0"
            />
            <Button size="sm" variant="outline" className="text-green-600" onClick={() => applyDelta(1)}>
              + Зцілення
            </Button>
            <Button size="sm" variant="outline" className="text-red-600" onClick={() => applyDelta(-1)}>
              − Шкода
            </Button>
            <Button size="sm" variant="ghost" onClick={() => updateHp(c.max_hit_points)}>
              Повне зцілення
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Характеристики */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Характеристики</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {abilities.map((ab) => (
                <div key={ab} className="text-center border rounded-lg p-3">
                  <div className="text-xs text-muted-foreground font-medium mb-1">
                    {ABILITY_LABELS[ab]}
                  </div>
                  <div className="text-2xl font-bold">{c[ab]}</div>
                  <div className="text-sm text-muted-foreground">{modifier(c[ab])}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Навички */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Навички</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {skillList.map((skill) => (
              <div key={skill.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${skill.isExpertise ? 'bg-primary' : skill.isProficient ? 'bg-primary/50' : 'bg-muted'}`} />
                  <span>{skill.name}</span>
                  <span className="text-xs text-muted-foreground">({skill.ability})</span>
                </div>
                <span className="font-medium tabular-nums">
                  {skill.bonus >= 0 ? `+${skill.bonus}` : skill.bonus}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Інвентар */}
      {c.inventory?.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Інвентар</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {c.inventory.map((item: any, i: number) => (
                <div key={i} className="flex items-start gap-2 text-sm p-2 rounded border">
                  <span className="font-medium min-w-0 flex-1">{item.name}</span>
                  {item.quantity > 1 && (
                    <Badge variant="secondary" className="shrink-0">×{item.quantity}</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Нотатки */}
      {c.notes && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Нотатки</CardTitle>
          </CardHeader>
          <CardContent className="text-sm whitespace-pre-line text-muted-foreground">
            {c.notes}
          </CardContent>
        </Card>
      )}
    </div>
  )
}