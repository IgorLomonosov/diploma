'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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

interface Option {
  value: string
  label: string
}

export default function NewCharacterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [races, setRaces] = useState<Option[]>([])
  const [classes, setClasses] = useState<Option[]>([])
  const [backgrounds, setBackgrounds] = useState<Option[]>([])
  const [optionsLoading, setOptionsLoading] = useState(true)

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

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [racesRes, classesRes, bgsRes] = await Promise.all([
          fetch('/api/races?limit=100'),
          fetch('/api/classes?limit=100'),
          fetch('/api/backgrounds?limit=100'),
        ])
        const [racesData, classesData, bgsData] = await Promise.all([
          racesRes.json(),
          classesRes.json(),
          bgsRes.json(),
        ])

        setRaces(
          (racesData.data || []).map((r: any) => ({
            value: r.name_uk || r.name_en,
            label: r.name_uk || r.name_en,
          })),
        )
        setClasses(
          (classesData.data || []).map((c: any) => ({
            value: c.name_uk || c.name_en,
            label: c.name_uk || c.name_en,
          })),
        )
        setBackgrounds(
          (bgsData.data || []).map((b: any) => ({
            value: b.name_uk || b.name_en,
            label: b.name_uk || b.name_en,
          })),
        )
      } catch (err) {
        console.error('Помилка завантаження опцій:', err)
      } finally {
        setOptionsLoading(false)
      }
    }
    fetchOptions()
  }, [])

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

  const selectClass =
    'w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm'

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
              className={selectClass}
              disabled={optionsLoading}
            >
              <option value="">
                {optionsLoading ? 'Завантаження...' : 'Обери расу'}
              </option>
              {races.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label>Клас</Label>
            <select
              value={form.class}
              onChange={(e) => update('class', e.target.value)}
              className={selectClass}
              disabled={optionsLoading}
            >
              <option value="">
                {optionsLoading ? 'Завантаження...' : 'Обери клас'}
              </option>
              {classes.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
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
              className={selectClass}
              disabled={optionsLoading}
            >
              <option value="">
                {optionsLoading ? 'Завантаження...' : 'Обери передісторію'}
              </option>
              {backgrounds.map((b) => (
                <option key={b.value} value={b.value}>
                  {b.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label>Мировозрення</Label>
            <select
              value={form.alignment}
              onChange={(e) => update('alignment', e.target.value)}
              className={selectClass}
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
          {[
            { key: 'max_hit_points', label: 'Макс. ПЗ' },
            { key: 'current_hit_points', label: 'Поточні ПЗ' },
            { key: 'armor_class', label: 'Клас обладунку' },
            { key: 'speed', label: 'Швидкість (фут.)' },
          ].map((f) => (
            <div key={f.key} className="space-y-2">
              <Label>{f.label}</Label>
              <Input
                type="number"
                min={0}
                value={form[f.key as keyof typeof form] as number}
                onChange={(e) => update(f.key, parseInt(e.target.value))}
              />
            </div>
          ))}
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
