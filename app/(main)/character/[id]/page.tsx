'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
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
  Акробатика: 'dexterity',
  'Догляд за тваринами': 'wisdom',
  'Таємні знання': 'intelligence',
  Атлетика: 'strength',
  Обман: 'charisma',
  Історія: 'intelligence',
  Проникливість: 'wisdom',
  Залякування: 'charisma',
  Розслідування: 'intelligence',
  Медицина: 'wisdom',
  Природознавство: 'intelligence',
  Сприйняття: 'wisdom',
  Виступ: 'charisma',
  Переконання: 'charisma',
  Релігія: 'intelligence',
  'Спритність рук': 'dexterity',
  Непомітність: 'dexterity',
  Виживання: 'wisdom',
}

const DEFAULT_SKILLS = Object.keys(SKILL_ABILITY)
const cardClass = 'rounded-xl border border-slate-700 bg-slate-900/60 p-5'

function modifier(val: number) {
  const mod = Math.floor((val - 10) / 2)
  return mod >= 0 ? `+${mod}` : `${mod}`
}
function modNum(val: number) {
  return Math.floor((val - 10) / 2)
}
function proficiencyBonus(level: number) {
  return Math.ceil(level / 4) + 1
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

  if (loading)
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-pulse">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-40 rounded-xl bg-slate-800/50" />
        ))}
      </div>
    )

  if (!character) return <p className="text-slate-400">Персонажа не знайдено</p>

  const c = character
  const abilities = [
    'strength',
    'dexterity',
    'constitution',
    'intelligence',
    'wisdom',
    'charisma',
  ]
  const profBonus = proficiencyBonus(c.level)

  const skillList = DEFAULT_SKILLS.map((skillName) => {
    const saved = c.skills?.find((s: any) => s.name === skillName)
    const abilityKey = SKILL_ABILITY[skillName]
    const abilityVal = c[abilityKey] ?? 10
    const isProficient = saved?.proficient ?? false
    const isExpertise = saved?.expertise ?? false
    const bonus =
      modNum(abilityVal) +
      (isExpertise ? profBonus * 2 : isProficient ? profBonus : 0)
    return {
      name: skillName,
      bonus,
      isProficient,
      isExpertise,
      ability: ABILITY_LABELS[abilityKey],
    }
  })

  const hpPercent =
    c.max_hit_points > 0 ? Math.round((currentHp / c.max_hit_points) * 100) : 0
  const hpColor =
    hpPercent > 50
      ? 'bg-green-500'
      : hpPercent > 25
        ? 'bg-yellow-500'
        : 'bg-red-500'

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Шапка */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-white">{c.name}</h1>
          <p className="text-slate-400 mt-1">
            {c.race && `${c.race} · `}
            {c.class} {c.level} рівня{c.background && ` · ${c.background}`}
          </p>
          {c.alignment && (
            <p className="text-sm text-slate-500">{t.alignment(c.alignment)}</p>
          )}
        </div>
        <div className="flex gap-2">
          {c.inspiration && (
            <span className="px-3 py-1 rounded-full bg-yellow-900/40 border border-yellow-700 text-yellow-300 text-sm">
              ✨ Натхнення
            </span>
          )}
          <button
            onClick={() => router.push(`/character/${id}/edit`)}
            className="px-3 py-1.5 text-sm rounded-md border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Редагувати
          </button>
        </div>
      </div>

      {/* Бойові характеристики */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Клас обладунку', value: c.armor_class },
          { label: 'Швидкість', value: `${c.speed} фут.` },
          { label: 'Бонус майстерності', value: `+${profBonus}` },
          { label: 'Досвід', value: c.experience_points },
        ].map((stat) => (
          <div key={stat.label} className={`${cardClass} text-center`}>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="text-xs text-slate-500 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Здоров'я */}
      <div className={cardClass}>
        <h2 className="text-base font-semibold text-white mb-3">
          Пункти здоров'я
        </h2>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-4xl font-bold text-white">{currentHp}</span>
          <span className="text-slate-500">/ {c.max_hit_points}</span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-3 mb-3">
          <div
            className={`h-3 rounded-full transition-all ${hpColor}`}
            style={{ width: `${hpPercent}%` }}
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="number"
            value={hpDelta}
            onChange={(e) => setHpDelta(e.target.value)}
            placeholder="0"
            min="0"
            className="w-20 h-9 rounded-md border border-slate-700 bg-slate-800 text-white px-3 text-sm"
          />
          <button
            onClick={() => applyDelta(1)}
            className="px-3 py-1.5 text-sm rounded-md border border-green-800 text-green-400 hover:bg-green-900/30 transition-colors"
          >
            + Зцілення
          </button>
          <button
            onClick={() => applyDelta(-1)}
            className="px-3 py-1.5 text-sm rounded-md border border-red-800 text-red-400 hover:bg-red-900/30 transition-colors"
          >
            − Шкода
          </button>
          <button
            onClick={() => updateHp(c.max_hit_points)}
            className="px-3 py-1.5 text-sm rounded-md border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Повне зцілення
          </button>
        </div>
      </div>

      {/* Характеристики */}
      <div className={cardClass}>
        <h2 className="text-base font-semibold text-white mb-3">
          Характеристики
        </h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {abilities.map((ab) => (
            <div
              key={ab}
              className="text-center rounded-lg border border-slate-700 bg-slate-800/50 p-3"
            >
              <div className="text-xs font-medium text-slate-500 mb-1">
                {ABILITY_LABELS[ab]}
              </div>
              <div className="text-2xl font-bold text-white">{c[ab]}</div>
              <div className="text-sm text-slate-400">{modifier(c[ab])}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Рятівні кидки */}
        <div className={cardClass}>
          <h2 className="text-base font-semibold text-white mb-3">
            Рятівні кидки
          </h2>
          <div className="space-y-1">
            {abilities.map((ab) => {
              const isProficient = c.saving_throws?.[ab] ?? false
              const bonus = modNum(c[ab] ?? 10) + (isProficient ? profBonus : 0)
              return (
                <div
                  key={ab}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${isProficient ? 'bg-red-400' : 'bg-slate-700'}`}
                    />
                    <span className="text-slate-300">{ABILITY_LABELS[ab]}</span>
                  </div>
                  <span className="font-medium tabular-nums text-white">
                    {bonus >= 0 ? `+${bonus}` : bonus}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Навички */}
        <div className={cardClass}>
          <h2 className="text-base font-semibold text-white mb-3">Навички</h2>
          <div className="space-y-1">
            {skillList.map((skill) => (
              <div
                key={skill.name}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${skill.isExpertise ? 'bg-yellow-400' : skill.isProficient ? 'bg-red-400' : 'bg-slate-700'}`}
                  />
                  <span className="text-slate-300">{skill.name}</span>
                  <span className="text-xs text-slate-600">
                    ({skill.ability})
                  </span>
                </div>
                <span className="font-medium tabular-nums text-white">
                  {skill.bonus >= 0 ? `+${skill.bonus}` : skill.bonus}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Інвентар */}
      {c.inventory?.length > 0 && (
        <div className={cardClass}>
          <h2 className="text-base font-semibold text-white mb-3">Інвентар</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {c.inventory.map((item: any, i: number) => (
              <div
                key={i}
                className="flex items-center justify-between text-sm p-2 rounded-lg border border-slate-700 bg-slate-800/50"
              >
                <span className="text-slate-300">{item.name}</span>
                {item.quantity > 1 && (
                  <span className="text-xs text-slate-500">
                    ×{item.quantity}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Нотатки */}
      {c.notes && (
        <div className={cardClass}>
          <h2 className="text-base font-semibold text-white mb-3">Нотатки</h2>
          <p className="text-sm text-slate-400 whitespace-pre-line">
            {c.notes}
          </p>
        </div>
      )}
    </div>
  )
}
