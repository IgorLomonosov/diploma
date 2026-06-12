'use client'

import { useState, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface MonsterResult {
  _id: string
  slug: string
  name_en: string
  name_uk: string
  challenge_rating: string
  hit_points: number
  armor_class: number
  type: string
  type_uk: string
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
}

const CONDITIONS = [
  'Отруєний',
  'Засліплений',
  'Приголомшений',
  'Збитий з ніг',
  'Паралізований',
  'Наляканий',
]

export default function EncounterPage() {
  const [combatants, setCombatants] = useState<Combatant[]>([])
  const [search, setSearch] = useState('')
  const [searchResults, setSearchResults] = useState<MonsterResult[]>([])
  const [searching, setSearching] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [round, setRound] = useState(1)
  const [started, setStarted] = useState(false)
  const [playerName, setPlayerName] = useState('')
  const [playerInitiative, setPlayerInitiative] = useState('')
  const [playerHp, setPlayerHp] = useState('')
  const [playerAc, setPlayerAc] = useState('')

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
      },
    ])
    setSearch('')
    setSearchResults([])
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
    } else {
      setActiveIndex(next)
    }
  }

  const updateHp = (id: string, delta: number) => {
    setCombatants((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              currentHp: Math.max(0, Math.min(c.maxHp, c.currentHp + delta)),
            }
          : c,
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

  const removeCombatant = (id: string) => {
    setCombatants((prev) => prev.filter((c) => c.id !== id))
  }

  const resetEncounter = () => {
    setStarted(false)
    setActiveIndex(0)
    setRound(1)
    setCombatants((prev) =>
      prev.map((c) => ({ ...c, currentHp: c.maxHp, conditions: [] })),
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold">Encounter Builder</h1>
          {started && (
            <p className="text-muted-foreground mt-1">Раунд {round}</p>
          )}
        </div>
        <div className="flex gap-2">
          {!started ? (
            <Button onClick={startEncounter} disabled={combatants.length === 0}>
              ⚔️ Почати бій
            </Button>
          ) : (
            <>
              <Button onClick={nextTurn}>Наступний хід →</Button>
              <Button variant="outline" onClick={resetEncounter}>
                Скинути
              </Button>
            </>
          )}
        </div>
      </div>

      {!started && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Додати монстра */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Додати монстра</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Input
                placeholder="Пошук монстра..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  searchMonsters(e.target.value)
                }}
              />
              {searching && (
                <p className="text-sm text-muted-foreground">Пошук...</p>
              )}
              {searchResults.map((m) => (
                <div
                  key={m._id}
                  className="flex items-center justify-between p-2 rounded border hover:bg-muted cursor-pointer text-sm"
                  onClick={() => addMonster(m)}
                >
                  <span>{m.name_uk || m.name_en}</span>
                  <div className="flex gap-1">
                    <Badge variant="secondary">CR {m.challenge_rating}</Badge>
                    <Badge variant="outline">ПЗ {m.hit_points}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Додати гравця */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Додати гравця</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Input
                placeholder="Ім'я"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
              />
              <div className="grid grid-cols-3 gap-2">
                <Input
                  placeholder="Ініціатива"
                  type="number"
                  value={playerInitiative}
                  onChange={(e) => setPlayerInitiative(e.target.value)}
                />
                <Input
                  placeholder="ПЗ"
                  type="number"
                  value={playerHp}
                  onChange={(e) => setPlayerHp(e.target.value)}
                />
                <Input
                  placeholder="КО"
                  type="number"
                  value={playerAc}
                  onChange={(e) => setPlayerAc(e.target.value)}
                />
              </div>
              <Button
                onClick={addPlayer}
                className="w-full"
                disabled={!playerName.trim()}
              >
                Додати гравця
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Список учасників */}
      {combatants.length > 0 && (
        <div className="space-y-2">
          {combatants.map((c, idx) => {
            const isActive = started && idx === activeIndex
            const isDead = c.currentHp === 0
            const hpPercent = Math.round((c.currentHp / c.maxHp) * 100)
            const hpColor =
              hpPercent > 50
                ? 'bg-green-500'
                : hpPercent > 25
                  ? 'bg-yellow-500'
                  : 'bg-red-500'

            return (
              <Card
                key={c.id}
                className={`transition-all ${isActive ? 'border-primary ring-1 ring-primary' : ''} ${isDead ? 'opacity-50' : ''}`}
              >
                <CardContent className="pt-3 pb-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    {/* Ініціатива */}
                    <div className="text-center min-w-10">
                      <div className="text-lg font-bold">{c.initiative}</div>
                      <div className="text-xs text-muted-foreground">ініц.</div>
                    </div>

                    {/* Ім'я та тип */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{c.name}</span>
                        {c.type === 'monster' && c.cr && (
                          <Badge variant="secondary" className="text-xs">
                            CR {c.cr}
                          </Badge>
                        )}
                        {c.type === 'player' && (
                          <Badge variant="outline" className="text-xs">
                            Гравець
                          </Badge>
                        )}
                        {isActive && (
                          <Badge className="text-xs">Активний</Badge>
                        )}
                        {isDead && (
                          <Badge variant="destructive" className="text-xs">
                            Впав
                          </Badge>
                        )}
                      </div>
                      {c.conditions.length > 0 && (
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {c.conditions.map((cond) => (
                            <Badge
                              key={cond}
                              variant="outline"
                              className="text-xs cursor-pointer text-orange-600"
                              onClick={() => toggleCondition(c.id, cond)}
                            >
                              {cond} ×
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* HP */}
                    <div className="flex items-center gap-2">
                      <div className="text-sm text-center min-w-20">
                        <div className="font-bold">
                          {c.currentHp} / {c.maxHp}
                        </div>
                        <div className="w-full bg-muted rounded-full h-1.5 mt-1">
                          <div
                            className={`h-1.5 rounded-full ${hpColor}`}
                            style={{ width: `${hpPercent}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 px-2 text-xs text-green-600"
                          onClick={() => updateHp(c.id, 5)}
                        >
                          +5
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 px-2 text-xs text-red-600"
                          onClick={() => updateHp(c.id, -5)}
                        >
                          -5
                        </Button>
                      </div>
                    </div>

                    {/* КО */}
                    <div className="text-center min-w-10">
                      <div className="font-bold">{c.ac}</div>
                      <div className="text-xs text-muted-foreground">КО</div>
                    </div>

                    {/* Стани */}
                    <div className="flex gap-1 flex-wrap max-w-40">
                      {CONDITIONS.map((cond) => (
                        <button
                          key={cond}
                          onClick={() => toggleCondition(c.id, cond)}
                          className={`text-xs px-1.5 py-0.5 rounded border transition-colors ${
                            c.conditions.includes(cond)
                              ? 'bg-orange-100 border-orange-400 text-orange-700'
                              : 'border-border text-muted-foreground hover:border-orange-300'
                          }`}
                        >
                          {cond.slice(0, 3)}
                        </button>
                      ))}
                    </div>

                    {!started && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => removeCombatant(c.id)}
                      >
                        ✕
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {combatants.length === 0 && (
        <p className="text-center text-muted-foreground py-12">
          Додайте монстрів та гравців щоб почати зустріч
        </p>
      )}
    </div>
  )
}
