'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const RACES = [
  'Людина',
  'Ельф',
  'Дворф',
  'Гнім',
  'Напівельф',
  'Напіворк',
  'Тіфлінг',
  'Драконород',
  'Гаплінг',
  'Інше',
]
const CLASSES = [
  'Варвар',
  'Бард',
  'Жрець',
  'Друїд',
  'Боєць',
  'Чернець',
  'Паладин',
  'Слідопит',
  'Злодій',
  'Чаклун',
  'Відьмак',
  'Чарівник',
]
const BACKGROUNDS = [
  'Прислужник',
  'Злочинець',
  'Народний герой',
  'Шляхтич',
  'Мудрець',
  'Солдат',
  'Странник',
  'Моряк',
  'Артист',
  'Відлюдник',
]
const ALIGNMENTS = [
  'Законно-добрий',
  'Нейтрально-добрий',
  'Хаотично-добрий',
  'Законно-нейтральний',
  'Істинно-нейтральний',
  'Хаотично-нейтральний',
  'Законно-злий',
  'Нейтрально-злий',
  'Хаотично-злий',
]

const DEFAULT_STATS = {
  strength: 10,
  dexterity: 10,
  constitution: 10,
  intelligence: 10,
  wisdom: 10,
  charisma: 10,
}

export default function NewCharacterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    race: '',
    class: '',
    level: 1,
    background: '',
    alignment: '',
    experience_points: 0,
    ...DEFAULT_STATS,
    max_hit_points: 8,
    current_hit_points: 8,
    armor_class: 10,
    speed: 30,
    notes: '',
  })

  const update = (field: string, value: string | number) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const modifier = (val: number) => {
    const mod = Math.floor((val - 10) / 2)
    return mod >= 0 ? `+${mod}` : `${mod}`
  }

  const handleSubmit = async () => {
    if (!form.name) {
      setError('Імʼя персонажа обовʼязкове')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/characters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error)
        return
      }
      router.push(`/character/${data.data._id}`)
    } catch {
      setError('Щось пішло не так')
    } finally {
      setLoading(false)
    }
  }

  const stats = [
    { key: 'strength', label: 'Сила' },
    { key: 'dexterity', label: 'Спритність' },
    { key: 'constitution', label: 'Витривалість' },
    { key: 'intelligence', label: 'Інтелект' },
    { key: 'wisdom', label: 'Мудрість' },
    { key: 'charisma', label: 'Харизма' },
  ]

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Новий персонаж</h1>

      <Card>
        <CardHeader>
          <CardTitle>Основна інформація</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2 space-y-2">
            <Label>Імʼя персонажа *</Label>
            <Input
              placeholder="Введи імʼя героя"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Раса</Label>
            <select
              value={form.race}
              onChange={(e) => update('race', e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
            >
              <option value="">Обери расу</option>
              {RACES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Клас</Label>
            <select
              value={form.class}
              onChange={(e) => update('class', e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
            >
              <option value="">Обери клас</option>
              {CLASSES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Рівень</Label>
            <Input
              type="number"
              min={1}
              max={20}
              value={form.level}
              onChange={(e) => update('level', parseInt(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label>Передісторія</Label>
            <select
              value={form.background}
              onChange={(e) => update('background', e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
            >
              <option value="">Обери передісторію</option>
              {BACKGROUNDS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Мировозрення</Label>
            <select
              value={form.alignment}
              onChange={(e) => update('alignment', e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
            >
              <option value="">Обери мировозрення</option>
              {ALIGNMENTS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Бойові характеристики</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>Макс. ПЗ</Label>
            <Input
              type="number"
              min={1}
              value={form.max_hit_points}
              onChange={(e) =>
                update('max_hit_points', parseInt(e.target.value))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Поточні ПЗ</Label>
            <Input
              type="number"
              min={0}
              value={form.current_hit_points}
              onChange={(e) =>
                update('current_hit_points', parseInt(e.target.value))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Клас обладунку</Label>
            <Input
              type="number"
              min={1}
              value={form.armor_class}
              onChange={(e) => update('armor_class', parseInt(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label>Швидкість (фут.)</Label>
            <Input
              type="number"
              min={0}
              value={form.speed}
              onChange={(e) => update('speed', parseInt(e.target.value))}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Характеристики</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 sm:grid-cols-6 gap-4">
          {stats.map((stat) => (
            <div key={stat.key} className="space-y-2 text-center">
              <Label className="text-xs">{stat.label}</Label>
              <Input
                type="number"
                min={1}
                max={30}
                value={form[stat.key as keyof typeof form] as number}
                onChange={(e) => update(stat.key, parseInt(e.target.value))}
                className="text-center"
              />
              <p className="text-sm text-muted-foreground">
                {modifier(form[stat.key as keyof typeof form] as number)}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Нотатки</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            value={form.notes}
            onChange={(e) => update('notes', e.target.value)}
            placeholder="Передісторія, опис зовнішності, цілі персонажа..."
            className="w-full min-h-32 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm resize-none"
          />
        </CardContent>
      </Card>

      {error && <p className="text-sm text-red-500 text-center">{error}</p>}

      <div className="flex gap-3 justify-end">
        <Button variant="outline" onClick={() => router.back()}>
          Скасувати
        </Button>
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? 'Збереження...' : 'Створити персонажа'}
        </Button>
      </div>
    </div>
  )
}
