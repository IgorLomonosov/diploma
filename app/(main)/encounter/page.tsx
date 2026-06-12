'use client'

import { useState, useCallback, useEffect } from 'react'

interface MonsterResult {
  _id: string
  name_en: string
  name_uk: string
  challenge_rating: string
  hit_points: number
  armor_class: number
}

interface CharacterResult {
  _id: string
  name: string
  class: string
  level: number
  current_hit_points: number
  max_hit_points: number
  armor_class: number
}

interface Combatant {
  id: string
  name: string
  initiative: number
  maxHp: number
  currentHp: number
  ac: number
  cr?: string
  type: 'monster' | 'player'
  conditions: string[]
  hpInput: string
}

const CONDITIONS = [
  'Отруєний',
  'Засліплений',
  'Приголомшений',
  'Збитий з ніг',
  'Паралізований',
  'Наляканий',
]
const cardClass = 'rounded-xl border border-slate-700 bg-slate-900/60 p-4'
const inputClass =
  'h-9 rounded-md border border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 px-3 text-sm w-full'

export default function EncounterPage() {
  const [combatants, setCombatants] = useState<Combatant[]>([])
  const [search, setSearch] = useState('')
  const [searchResults, setSearchResults] = useState<MonsterResult[]>([])
  const [searching, setSearching] = useState(false)
  const [characters, setCharacters] = useState<CharacterResult[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [round, setRound] = useState(1)
  const [started, setStarted] = useState(false)
  const [playerName, setPlayerName] = useState('')
  const [playerInitiative, setPlayerInitiative] = useState('')
  const [playerHp, setPlayerHp] = useState('')
  const [playerAc, setPlayerAc] = useState('')

  useEffect(() => {
    fetch('/api/characters')
      .then((r) => r.json())
      .then((d) => setCharacters(d.data || []))
      .catch(() => {})
  }, [])

  const searchMonsters = useCallback(async (q: string) => {
    if (!q.trim()) {
      setSearchResults([])
      return
    }
    setSearching(true)
    try {
      const res = await fetch(`/api/monsters?search=${q}&limit=6`)
      const data = await res.json()
      setSearchResults(data.data || [])
    } catch {
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }, [])

  const addMonster = (m: MonsterResult) => {
    const existing = combatants.filter((c) =>
      c.name.startsWith(m.name_uk || m.name_en),
    )
    const suffix = existing.length > 0 ? ` ${existing.length + 1}` : ''
    setCombatants((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: `${m.name_uk || m.name_en}${suffix}`,
        initiative: Math.floor(Math.random() * 20) + 1,
        maxHp: m.hit_points,
        currentHp: m.hit_points,
        ac: m.armor_class,
        cr: m.challenge_rating,
        type: 'monster',
        conditions: [],
        hpInput: '',
      },
    ])
    setSearch('')
    setSearchResults([])
  }

  const addCharacter = (char: CharacterResult) => {
    const alreadyAdded = combatants.some((c) => c.name === char.name)
    setCombatants((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: alreadyAdded ? `${char.name} 2` : char.name,
        initiative: 0,
        maxHp: char.max_hit_points,
        currentHp: char.current_hit_points,
        ac: char.armor_class,
        type: 'player',
        conditions: [],
        hpInput: '',
      },
    ])
  }

  const addPlayer = () => {
    if (!playerName.trim()) return
    setCombatants((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: playerName,
        initiative: parseInt(playerInitiative) || 0,
        maxHp: parseInt(playerHp) || 20,
        currentHp: parseInt(playerHp) || 20,
        ac: parseInt(playerAc) || 10,
        type: 'player',
        conditions: [],
        hpInput: '',
      },
    ])
    setPlayerName('')
    setPlayerInitiative('')
    setPlayerHp('')
    setPlayerAc('')
  }

  const startEncounter = () => {
    setCombatants((prev) =>
      [...prev].sort((a, b) => b.initiative - a.initiative),
    )
    setActiveIndex(0)
    setRound(1)
    setStarted(true)
  }

  const nextTurn = () => {
    const next = activeIndex + 1
    if (next >= combatants.length) {
      setActiveIndex(0)
      setRound((r) => r + 1)
    } else setActiveIndex(next)
  }

  const applyHp = (id: string, sign: 1 | -1) => {
    setCombatants((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c
        const val = parseInt(c.hpInput)
        if (isNaN(val) || val <= 0) return c
        return {
          ...c,
          currentHp: Math.max(0, Math.min(c.maxHp, c.currentHp + sign * val)),
          hpInput: '',
        }
      }),
    )
  }

  const setHpInput = (id: string, value: string) => {
    setCombatants((prev) =>
      prev.map((c) => (c.id === id ? { ...c, hpInput: value } : c)),
    )
  }

  const setInitiative = (id: string, value: string) => {
    setCombatants((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, initiative: parseInt(value) || 0 } : c,
      ),
    )
  }

  const toggleCondition = (id: string, cond: string) => {
    setCombatants((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              conditions: c.conditions.includes(cond)
                ? c.conditions.filter((x) => x !== cond)
                : [...c.conditions, cond],
            }
          : c,
      ),
    )
  }

  const removeCombatant = (id: string) =>
    setCombatants((prev) => prev.filter((c) => c.id !== id))

  const resetEncounter = () => {
    setStarted(false)
    setActiveIndex(0)
    setRound(1)
    setCombatants((prev) =>
      prev.map((c) => ({
        ...c,
        currentHp: c.maxHp,
        conditions: [],
        hpInput: '',
      })),
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-white">Симуляція Бою</h1>
          {started && <p className="text-slate-400 mt-1">Раунд {round}</p>}
        </div>
        <div className="flex gap-2">
          {!started ? (
            <button
              onClick={startEncounter}
              disabled={combatants.length === 0}
              className="px-4 py-2 text-sm rounded-md bg-red-800 hover:bg-red-700 text-white font-medium transition-colors disabled:opacity-40"
            >
              Почати бій
            </button>
          ) : (
            <>
              <button
                onClick={nextTurn}
                className="px-4 py-2 text-sm rounded-md bg-red-800 hover:bg-red-700 text-white font-medium transition-colors"
              >
                Наступний хід →
              </button>
              <button
                onClick={resetEncounter}
                className="px-3 py-1.5 text-sm rounded-md border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Скинути
              </button>
            </>
          )}
        </div>
      </div>

      {!started && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Додати монстра */}
          <div className={cardClass}>
            <h2 className="text-base font-semibold text-white mb-3">Монстр</h2>
            <div className="space-y-2">
              <input
                placeholder="Пошук монстра..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  searchMonsters(e.target.value)
                }}
                className={inputClass}
              />
              {searching && <p className="text-sm text-slate-500">Пошук...</p>}
              {searchResults.map((m) => (
                <div
                  key={m._id}
                  onClick={() => addMonster(m)}
                  className="flex items-center justify-between p-2 rounded-lg border border-slate-700 hover:bg-slate-800 cursor-pointer text-sm"
                >
                  <span className="text-slate-300 truncate">
                    {m.name_uk || m.name_en}
                  </span>
                  <div className="flex gap-1 shrink-0 ml-2">
                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-red-900/50 text-red-300">
                      CR {m.challenge_rating}
                    </span>
                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-slate-700 text-slate-300">
                      ПЗ {m.hit_points}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Додати персонажа з бази */}
          <div className={cardClass}>
            <h2 className="text-base font-semibold text-white mb-3">
              Персонаж
            </h2>
            {characters.length === 0 ? (
              <p className="text-sm text-slate-500">Немає персонажів</p>
            ) : (
              <div className="space-y-2">
                {characters.map((char) => (
                  <div
                    key={char._id}
                    onClick={() => addCharacter(char)}
                    className="flex items-center justify-between p-2 rounded-lg border border-slate-700 hover:bg-slate-800 cursor-pointer text-sm"
                  >
                    <div className="min-w-0">
                      <p className="text-slate-300 font-medium truncate">
                        {char.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {char.class} · {char.level} рів.
                      </p>
                    </div>
                    <div className="flex gap-1 shrink-0 ml-2">
                      <span className="text-xs px-1.5 py-0.5 rounded-full bg-slate-700 text-slate-300">
                        ПЗ {char.current_hit_points}/{char.max_hit_points}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Додати гравця вручну */}
          <div className={cardClass}>
            <h2 className="text-base font-semibold text-white mb-3">
              Гравець вручну
            </h2>
            <div className="space-y-2">
              <input
                placeholder="Ім'я"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className={inputClass}
              />
              <div className="grid grid-cols-3 gap-2">
                <input
                  placeholder="Ініц."
                  type="number"
                  value={playerInitiative}
                  onChange={(e) => setPlayerInitiative(e.target.value)}
                  className={inputClass}
                />
                <input
                  placeholder="ПЗ"
                  type="number"
                  value={playerHp}
                  onChange={(e) => setPlayerHp(e.target.value)}
                  className={inputClass}
                />
                <input
                  placeholder="КО"
                  type="number"
                  value={playerAc}
                  onChange={(e) => setPlayerAc(e.target.value)}
                  className={inputClass}
                />
              </div>
              <button
                onClick={addPlayer}
                disabled={!playerName.trim()}
                className="w-full px-4 py-2 text-sm rounded-md bg-red-800 hover:bg-red-700 text-white font-medium transition-colors disabled:opacity-40"
              >
                Додати
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ініціатива перед боєм */}
      {!started && combatants.length > 0 && (
        <div className={cardClass}>
          <h2 className="text-base font-semibold text-white mb-3">
            Ініціатива
          </h2>
          <div className="space-y-2">
            {combatants.map((c) => (
              <div key={c.id} className="flex items-center gap-3">
                <input
                  type="number"
                  value={c.initiative}
                  onChange={(e) => setInitiative(c.id, e.target.value)}
                  className="w-16 h-8 rounded-md border border-slate-700 bg-slate-800 text-white px-2 text-sm text-center"
                />
                <span className="text-slate-300 text-sm flex-1">{c.name}</span>
                <span className="text-xs text-slate-500">
                  {c.type === 'monster' ? `CR ${c.cr}` : 'Гравець'}
                </span>
                <button
                  onClick={() => removeCombatant(c.id)}
                  className="text-slate-600 hover:text-red-400 transition-colors text-sm"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Список учасників під час бою */}
      {started && combatants.length > 0 && (
        <div className="space-y-2">
          {combatants.map((c, idx) => {
            const isActive = idx === activeIndex
            const isDead = c.currentHp === 0
            const hpPercent = Math.round((c.currentHp / c.maxHp) * 100)
            const hpColor =
              hpPercent > 50
                ? 'bg-green-500'
                : hpPercent > 25
                  ? 'bg-yellow-500'
                  : 'bg-red-500'

            return (
              <div
                key={c.id}
                className={`rounded-xl border p-4 transition-all ${
                  isActive
                    ? 'border-red-600 bg-red-950/20'
                    : 'border-slate-700 bg-slate-900/60'
                } ${isDead ? 'opacity-40' : ''}`}
              >
                <div className="flex items-center gap-3 flex-wrap">
                  {/* Ініціатива */}
                  <div className="text-center min-w-10">
                    <div className="text-lg font-bold text-white">
                      {c.initiative}
                    </div>
                    <div className="text-xs text-slate-500">ініц.</div>
                  </div>

                  {/* Ім'я */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-white">{c.name}</span>
                      {c.type === 'monster' && c.cr && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-900/50 text-red-300">
                          CR {c.cr}
                        </span>
                      )}
                      {c.type === 'player' && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">
                          Гравець
                        </span>
                      )}
                      {isActive && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-800 text-white">
                          Активний
                        </span>
                      )}
                      {isDead && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                          Впав
                        </span>
                      )}
                    </div>
                    {c.conditions.length > 0 && (
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {c.conditions.map((cond) => (
                          <button
                            key={cond}
                            onClick={() => toggleCondition(c.id, cond)}
                            className="text-xs px-2 py-0.5 rounded-full bg-orange-900/40 border border-orange-700 text-orange-300"
                          >
                            {cond} ×
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* HP з довільним інпутом */}
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-center">
                      <div className="font-bold text-white mb-1">
                        {c.currentHp} / {c.maxHp}
                      </div>
                      <div className="w-24 bg-slate-800 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full transition-all ${hpColor}`}
                          style={{ width: `${hpPercent}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={c.hpInput}
                        onChange={(e) => setHpInput(c.id, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') applyHp(c.id, 1)
                        }}
                        placeholder="0"
                        min="0"
                        className="w-14 h-8 rounded border border-slate-700 bg-slate-800 text-white px-2 text-sm text-center"
                      />
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => applyHp(c.id, 1)}
                          className="h-8 px-2 text-xs rounded border border-green-800 text-green-400 hover:bg-green-900/30 transition-colors"
                        >
                          +ПЗ
                        </button>
                        <button
                          onClick={() => applyHp(c.id, -1)}
                          className="h-8 px-2 text-xs rounded border border-red-800 text-red-400 hover:bg-red-900/30 transition-colors"
                        >
                          −ПЗ
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* КО */}
                  <div className="text-center min-w-10">
                    <div className="font-bold text-white">{c.ac}</div>
                    <div className="text-xs text-slate-500">КО</div>
                  </div>

                  {/* Стани */}
                  <div className="flex gap-1 flex-wrap max-w-36">
                    {CONDITIONS.map((cond) => (
                      <button
                        key={cond}
                        onClick={() => toggleCondition(c.id, cond)}
                        className={`text-xs px-1.5 py-0.5 rounded border transition-colors ${
                          c.conditions.includes(cond)
                            ? 'bg-orange-900/40 border-orange-700 text-orange-300'
                            : 'border-slate-700 text-slate-500 hover:border-orange-700'
                        }`}
                      >
                        {cond.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {combatants.length === 0 && (
        <p className="text-center text-slate-600 py-12">
          Додайте монстрів та гравців щоб почати зустріч
        </p>
      )}
    </div>
  )
}
