'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

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

const DEFAULT_SKILLS_STATE = [
  { name: 'Акробатика', ability: 'СПР', proficient: false, expertise: false },
  {
    name: 'Догляд за тваринами',
    ability: 'МУД',
    proficient: false,
    expertise: false,
  },
  {
    name: 'Таємні знання',
    ability: 'ІНТ',
    proficient: false,
    expertise: false,
  },
  { name: 'Атлетика', ability: 'СИЛ', proficient: false, expertise: false },
  { name: 'Обман', ability: 'ХАР', proficient: false, expertise: false },
  { name: 'Історія', ability: 'ІНТ', proficient: false, expertise: false },
  {
    name: 'Проникливість',
    ability: 'МУД',
    proficient: false,
    expertise: false,
  },
  { name: 'Залякування', ability: 'ХАР', proficient: false, expertise: false },
  {
    name: 'Розслідування',
    ability: 'ІНТ',
    proficient: false,
    expertise: false,
  },
  { name: 'Медицина', ability: 'МУД', proficient: false, expertise: false },
  {
    name: 'Природознавство',
    ability: 'ІНТ',
    proficient: false,
    expertise: false,
  },
  { name: 'Сприйняття', ability: 'МУД', proficient: false, expertise: false },
  { name: 'Виступ', ability: 'ХАР', proficient: false, expertise: false },
  { name: 'Переконання', ability: 'ХАР', proficient: false, expertise: false },
  { name: 'Релігія', ability: 'ІНТ', proficient: false, expertise: false },
  {
    name: 'Спритність рук',
    ability: 'СПР',
    proficient: false,
    expertise: false,
  },
  { name: 'Непомітність', ability: 'СПР', proficient: false, expertise: false },
  { name: 'Виживання', ability: 'МУД', proficient: false, expertise: false },
]

const DEFAULT_SAVING_THROWS = {
  strength: false,
  dexterity: false,
  constitution: false,
  intelligence: false,
  wisdom: false,
  charisma: false,
}

const SAVING_THROW_LABELS: Record<string, string> = {
  strength: 'Сила',
  dexterity: 'Спритність',
  constitution: 'Витривалість',
  intelligence: 'Інтелект',
  wisdom: 'Мудрість',
  charisma: 'Харизма',
}

interface Option {
  value: string
  label: string
}

const cardClass = 'rounded-xl border border-slate-700 bg-slate-900/60 p-5'
const inputClass =
  'w-full h-9 rounded-md border border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 px-3 text-sm'
const selectClass =
  'w-full h-9 rounded-md border border-slate-700 bg-slate-800 text-slate-200 px-3 text-sm'
const labelClass = 'block text-sm text-slate-400 mb-1.5'

function proficiencyBonus(level: number) {
  return Math.ceil(level / 4) + 1
}

export default function EditCharacterPage() {
  const router = useRouter()
  const { id } = useParams()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')
  const [races, setRaces] = useState<Option[]>([])
  const [classes, setClasses] = useState<Option[]>([])
  const [backgrounds, setBackgrounds] = useState<Option[]>([])
  const [skills, setSkills] = useState(DEFAULT_SKILLS_STATE)
  const [savingThrows, setSavingThrows] = useState(DEFAULT_SAVING_THROWS)

  const [form, setForm] = useState({
    name: '',
    race: '',
    class: '',
    level: 1,
    background: '',
    alignment: '',
    experience_points: 0,
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
    max_hit_points: 8,
    current_hit_points: 8,
    armor_class: 10,
    speed: 30,
    notes: '',
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [charRes, racesRes, classesRes, bgsRes] = await Promise.all([
          fetch(`/api/characters/${id}`),
          fetch('/api/races?limit=100'),
          fetch('/api/classes?limit=100'),
          fetch('/api/backgrounds?limit=100'),
        ])
        const [charData, racesData, classesData, bgsData] = await Promise.all([
          charRes.json(),
          racesRes.json(),
          classesRes.json(),
          bgsRes.json(),
        ])

        if (charData.data) {
          const c = charData.data
          setForm({
            name: c.name || '',
            race: c.race || '',
            class: c.class || '',
            level: c.level || 1,
            background: c.background || '',
            alignment: c.alignment || '',
            experience_points: c.experience_points || 0,
            strength: c.strength || 10,
            dexterity: c.dexterity || 10,
            constitution: c.constitution || 10,
            intelligence: c.intelligence || 10,
            wisdom: c.wisdom || 10,
            charisma: c.charisma || 10,
            max_hit_points: c.max_hit_points || 8,
            current_hit_points: c.current_hit_points || 8,
            armor_class: c.armor_class || 10,
            speed: c.speed || 30,
            notes: c.notes || '',
          })

          if (c.skills?.length > 0) {
            setSkills((prev) =>
              prev.map((skill) => {
                const saved = c.skills.find((s: any) => s.name === skill.name)
                return saved
                  ? {
                      ...skill,
                      proficient: saved.proficient,
                      expertise: saved.expertise,
                    }
                  : skill
              }),
            )
          }

          if (c.saving_throws) {
            setSavingThrows({
              strength: c.saving_throws.strength ?? false,
              dexterity: c.saving_throws.dexterity ?? false,
              constitution: c.saving_throws.constitution ?? false,
              intelligence: c.saving_throws.intelligence ?? false,
              wisdom: c.saving_throws.wisdom ?? false,
              charisma: c.saving_throws.charisma ?? false,
            })
          }
        }

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
        setError('Помилка завантаження даних')
      } finally {
        setFetching(false)
      }
    }
    fetchData()
  }, [id])

  const update = (field: string, value: string | number) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const modifier = (val: number) => {
    const mod = Math.floor((val - 10) / 2)
    return mod >= 0 ? `+${mod}` : `${mod}`
  }

  const toggleSkill = (
    idx: number,
    field: 'proficient' | 'expertise',
    value: boolean,
  ) => {
    setSkills((prev) =>
      prev.map((s, i) => {
        if (i !== idx) return s
        if (field === 'proficient')
          return {
            ...s,
            proficient: value,
            expertise: value ? s.expertise : false,
          }
        return { ...s, expertise: value }
      }),
    )
  }

  const handleSubmit = async () => {
    if (!form.name) {
      setError('Імʼя персонажа обовʼязкове')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/characters/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          skills: skills.map((s) => ({
            name: s.name,
            proficient: s.proficient,
            expertise: s.expertise,
          })),
          saving_throws: savingThrows,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error)
        return
      }
      router.push(`/character/${id}`)
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

  const profBonus = proficiencyBonus(form.level)

  if (fetching)
    return (
      <div className="max-w-3xl mx-auto space-y-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-40 rounded-xl bg-slate-800/50 animate-pulse"
          />
        ))}
      </div>
    )

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Редагування персонажа</h1>
        <button
          onClick={() => router.push(`/character/${id}`)}
          className="px-3 py-1.5 text-sm rounded-md border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          ← Назад
        </button>
      </div>

      {/* Основна інформація */}
      <div className={cardClass}>
        <h2 className="text-base font-semibold text-white mb-4">
          Основна інформація
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className={labelClass}>Імʼя персонажа *</label>
            <input
              placeholder="Введи імʼя героя"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Раса</label>
            <select
              value={form.race}
              onChange={(e) => update('race', e.target.value)}
              className={selectClass}
            >
              <option value="">Обери расу</option>
              {races.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Клас</label>
            <select
              value={form.class}
              onChange={(e) => update('class', e.target.value)}
              className={selectClass}
            >
              <option value="">Обери клас</option>
              {classes.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Рівень</label>
            <input
              type="number"
              min={1}
              max={20}
              value={form.level}
              onChange={(e) => update('level', parseInt(e.target.value))}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Досвід</label>
            <input
              type="number"
              min={0}
              value={form.experience_points}
              onChange={(e) =>
                update('experience_points', parseInt(e.target.value))
              }
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Передісторія</label>
            <select
              value={form.background}
              onChange={(e) => update('background', e.target.value)}
              className={selectClass}
            >
              <option value="">Обери передісторію</option>
              {backgrounds.map((b) => (
                <option key={b.value} value={b.value}>
                  {b.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Світогляд</label>
            <select
              value={form.alignment}
              onChange={(e) => update('alignment', e.target.value)}
              className={selectClass}
            >
              <option value="">Обери Світогляд</option>
              {ALIGNMENTS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Бойові характеристики */}
      <div className={cardClass}>
        <h2 className="text-base font-semibold text-white mb-4">
          Бойові характеристики
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { key: 'max_hit_points', label: 'Макс. ПЗ' },
            { key: 'current_hit_points', label: 'Поточні ПЗ' },
            { key: 'armor_class', label: 'Клас обладунку' },
            { key: 'speed', label: 'Швидкість (фут.)' },
          ].map((f) => (
            <div key={f.key}>
              <label className={labelClass}>{f.label}</label>
              <input
                type="number"
                min={0}
                value={form[f.key as keyof typeof form] as number}
                onChange={(e) => update(f.key, parseInt(e.target.value))}
                className={inputClass}
              />
            </div>
          ))}
        </div>
        <div className="mt-3 text-sm text-slate-400">
          Бонус майстерності для {form.level} рівня:{' '}
          <span className="text-white font-medium">+{profBonus}</span>
        </div>
      </div>

      {/* Характеристики */}
      <div className={cardClass}>
        <h2 className="text-base font-semibold text-white mb-4">
          Характеристики
        </h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
          {stats.map((stat) => (
            <div key={stat.key} className="text-center">
              <label className="block text-xs text-slate-400 mb-1.5">
                {stat.label}
              </label>
              <input
                type="number"
                min={1}
                max={30}
                value={form[stat.key as keyof typeof form] as number}
                onChange={(e) => update(stat.key, parseInt(e.target.value))}
                className={`${inputClass} text-center`}
              />
              <p className="text-sm text-slate-500 mt-1">
                {modifier(form[stat.key as keyof typeof form] as number)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Рятівні кидки */}
      <div className={cardClass}>
        <h2 className="text-base font-semibold text-white mb-4">
          Рятівні кидки
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {Object.entries(savingThrows).map(([ability, value]) => (
            <label
              key={ability}
              className="flex items-center gap-2 cursor-pointer p-2 rounded-lg border border-slate-700 hover:bg-slate-800/50 transition-colors"
            >
              <input
                type="checkbox"
                checked={value}
                onChange={(e) =>
                  setSavingThrows((prev) => ({
                    ...prev,
                    [ability]: e.target.checked,
                  }))
                }
                className="w-4 h-4 accent-red-600"
              />
              <span className="text-sm text-slate-300">
                {SAVING_THROW_LABELS[ability]}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Навички */}
      <div className={cardClass}>
        <h2 className="text-base font-semibold text-white mb-1">Навички</h2>
        <p className="text-xs text-slate-500 mb-4">
          П — Майстерність · Е — Компетенція (подвійний бонус)
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
          {skills.map((skill, idx) => (
            <div
              key={skill.name}
              className="flex items-center justify-between p-2 rounded-lg border border-slate-700 hover:bg-slate-800/30 transition-colors"
            >
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500 w-7">
                  {skill.ability}
                </span>
                <span className="text-sm text-slate-300">{skill.name}</span>
              </div>
              <div className="flex gap-3">
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={skill.proficient}
                    onChange={(e) =>
                      toggleSkill(idx, 'proficient', e.target.checked)
                    }
                    className="w-3.5 h-3.5 accent-red-600"
                  />
                  <span className="text-xs text-slate-500">П</span>
                </label>
                <label
                  className={`flex items-center gap-1 ${!skill.proficient ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <input
                    type="checkbox"
                    checked={skill.expertise}
                    disabled={!skill.proficient}
                    onChange={(e) =>
                      toggleSkill(idx, 'expertise', e.target.checked)
                    }
                    className="w-3.5 h-3.5 accent-yellow-500"
                  />
                  <span className="text-xs text-slate-500">Е</span>
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Нотатки */}
      <div className={cardClass}>
        <h2 className="text-base font-semibold text-white mb-4">Нотатки</h2>
        <textarea
          value={form.notes}
          onChange={(e) => update('notes', e.target.value)}
          placeholder="Передісторія, опис зовнішності, цілі персонажа..."
          className="w-full min-h-32 rounded-md border border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 px-3 py-2 text-sm resize-none"
        />
      </div>

      {error && <p className="text-sm text-red-400 text-center">{error}</p>}

      <div className="flex gap-3 justify-end">
        <button
          onClick={() => router.push(`/character/${id}`)}
          className="px-4 py-2 text-sm rounded-md border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
        >
          Скасувати
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-4 py-2 text-sm rounded-md bg-red-800 hover:bg-red-700 text-white font-medium transition-colors disabled:opacity-50"
        >
          {loading ? 'Збереження...' : 'Зберегти зміни'}
        </button>
      </div>
    </div>
  )
}
